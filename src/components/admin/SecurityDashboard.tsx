import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, AlertTriangle, Unlock, Clock, Globe, User } from 'lucide-react';
import { useToast } from './ToastContainer';
import { sendTelegramNotification } from '../../utils/securityHelpers';

interface LoginAttempt {
  id: string;
  email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason?: string;
  attempted_at: string;
}

interface AccountLockout {
  id: string;
  email: string;
  locked_at: string;
  unlock_at: string;
  failed_attempts: number;
  is_locked: boolean;
  locked_by: string;
}

interface SecurityConfig {
  id: string;
  telegram_bot_token?: string;
  telegram_chat_id?: string;
  max_failed_attempts: number;
  lockout_duration_minutes: number;
  session_timeout_minutes: number;
  log_retention_days: number;
}

export default function SecurityDashboard() {
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [lockedAccounts, setLockedAccounts] = useState<AccountLockout[]>([]);
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [cleaningLogs, setCleaningLogs] = useState(false);
  const [testingBot, setTestingBot] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const attemptsPerPage = 20;
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * attemptsPerPage;
      const to = from + attemptsPerPage - 1;

      const [attemptsRes, countRes, lockoutsRes, configRes] = await Promise.all([
        supabase
          .from('login_attempts')
          .select('*')
          .order('attempted_at', { ascending: false })
          .range(from, to),
        supabase
          .from('login_attempts')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('account_lockouts')
          .select('*')
          .eq('is_locked', true)
          .order('locked_at', { ascending: false }),
        supabase
          .from('security_config')
          .select('*')
          .single(),
      ]);

      if (attemptsRes.data) setLoginAttempts(attemptsRes.data);
      if (countRes.count) setTotalAttempts(countRes.count);
      if (lockoutsRes.data) setLockedAccounts(lockoutsRes.data);
      if (configRes.data) setSecurityConfig(configRes.data);
    } catch (error) {
      console.error('Failed to load security data:', error);
      showToast('Failed to load security data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (email: string) => {
    try {
      const { error } = await supabase
        .from('account_lockouts')
        .update({ is_locked: false })
        .eq('email', email);

      if (error) throw error;

      await sendTelegramNotification({
        type: 'manual_unlock',
        email,
        details: 'Account manually unlocked by admin',
      });

      showToast('Account unlocked successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Failed to unlock account:', error);
      showToast('Failed to unlock account', 'error');
    }
  };

  const handleSaveConfig = async () => {
    if (!securityConfig) return;

    setSavingConfig(true);
    try {
      const { error } = await supabase
        .from('security_config')
        .update({
          telegram_bot_token: securityConfig.telegram_bot_token,
          telegram_chat_id: securityConfig.telegram_chat_id,
          max_failed_attempts: securityConfig.max_failed_attempts,
          lockout_duration_minutes: securityConfig.lockout_duration_minutes,
          session_timeout_minutes: securityConfig.session_timeout_minutes,
          log_retention_days: securityConfig.log_retention_days,
          updated_at: new Date().toISOString(),
        })
        .eq('id', securityConfig.id);

      if (error) throw error;

      showToast('Security settings saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save security config:', error);
      showToast('Failed to save security settings', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCleanupLogs = async () => {
    if (!securityConfig) return;

    const message = `This will permanently delete login attempts older than ${securityConfig.log_retention_days} days. Continue?`;
    if (!confirm(message)) {
      return;
    }

    setCleaningLogs(true);
    try {
      const { data, error } = await supabase.rpc('cleanup_old_login_attempts');

      if (error) throw error;

      const deletedCount = data as number;
      if (deletedCount > 0) {
        showToast(`Successfully deleted ${deletedCount} old login attempt(s)`, 'success');
      } else {
        showToast('No old logs found to delete', 'success');
      }
      loadData();
    } catch (error) {
      console.error('Failed to cleanup logs:', error);
      showToast('Failed to cleanup old logs', 'error');
    } finally {
      setCleaningLogs(false);
    }
  };

  const handleTestBot = async () => {
    if (!securityConfig?.telegram_bot_token || !securityConfig?.telegram_chat_id) {
      showToast('Please configure Telegram Bot Token and Chat ID first', 'error');
      return;
    }

    setTestingBot(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-telegram-notification`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'test',
            email: user?.email || 'admin',
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send test notification');
      }

      showToast('Test notification sent successfully! Check your Telegram.', 'success');
    } catch (error: any) {
      console.error('Failed to test bot:', error);
      showToast(error.message || 'Failed to send test notification', 'error');
    } finally {
      setTestingBot(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading security data...</div>
      </div>
    );
  }

  const failedAttempts = loginAttempts.filter(a => !a.success).length;
  const successfulAttempts = loginAttempts.filter(a => a.success).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Security Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Failed Attempts (24h)</p>
              <p className="text-3xl font-bold text-red-400 mt-2">{failedAttempts}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-400 opacity-20" />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Successful Logins</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{successfulAttempts}</p>
            </div>
            <Shield className="w-10 h-10 text-green-400 opacity-20" />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Locked Accounts</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{lockedAccounts.length}</p>
            </div>
            <Unlock className="w-10 h-10 text-yellow-400 opacity-20" />
          </div>
        </div>
      </div>

      {securityConfig && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Telegram Bot Token</label>
              <input
                type="text"
                value={securityConfig.telegram_bot_token || ''}
                onChange={(e) => setSecurityConfig({ ...securityConfig, telegram_bot_token: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Telegram Chat ID</label>
              <input
                type="text"
                value={securityConfig.telegram_chat_id || ''}
                onChange={(e) => setSecurityConfig({ ...securityConfig, telegram_chat_id: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456789"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Max Failed Attempts</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={securityConfig.max_failed_attempts}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 3;
                  setSecurityConfig({ ...securityConfig, max_failed_attempts: Math.min(Math.max(val, 3), 10) });
                }}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="3-10"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Lockout Duration (minutes)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={securityConfig.lockout_duration_minutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 15;
                  setSecurityConfig({ ...securityConfig, lockout_duration_minutes: Math.min(Math.max(val, 15), 1440) });
                }}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="15-1440"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Session Timeout (minutes)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={securityConfig.session_timeout_minutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 15;
                  setSecurityConfig({ ...securityConfig, session_timeout_minutes: Math.min(Math.max(val, 15), 1440) });
                }}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="15-1440"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Log Retention (days)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={securityConfig.log_retention_days}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 7;
                  setSecurityConfig({ ...securityConfig, log_retention_days: Math.min(Math.max(val, 7), 365) });
                }}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="7-365"
              />
              <p className="text-xs text-slate-500 mt-1">Used for manual cleanup - logs older than this can be deleted with the cleanup button</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>How to get Telegram Bot Token & Chat ID:</strong>
              <br />
              1. Open Telegram and search for @BotFather
              <br />
              2. Send /newbot and follow the instructions
              <br />
              3. Copy the bot token provided
              <br />
              4. Search for @userinfobot to get your Chat ID
              <br />
              5. Start a conversation with your bot first before testing
            </p>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white rounded-lg transition-colors"
            >
              {savingConfig ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              onClick={handleTestBot}
              disabled={testingBot || !securityConfig?.telegram_bot_token || !securityConfig?.telegram_chat_id}
              className="px-6 py-2 bg-green-500/20 hover:bg-green-500/30 disabled:bg-slate-700 text-green-400 rounded-lg transition-colors border border-green-500/30"
            >
              {testingBot ? 'Testing...' : 'Test Bot'}
            </button>
          </div>
        </div>
      )}

      {lockedAccounts.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Locked Accounts</h3>
          <div className="space-y-3">
            {lockedAccounts.map((lockout) => (
              <div key={lockout.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="flex-1">
                  <p className="text-white font-medium">{lockout.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Locked: {new Date(lockout.locked_at).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {lockout.failed_attempts} attempts
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleUnlock(lockout.email)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Unlock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Login Attempts</h3>
          <button
            onClick={handleCleanupLogs}
            disabled={cleaningLogs}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 disabled:bg-slate-700 text-orange-400 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            {cleaningLogs ? 'Cleaning...' : `Cleanup Old (${securityConfig?.log_retention_days || 90}+ days)`}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">IP Address</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Details</th>
              </tr>
            </thead>
            <tbody>
              {loginAttempts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No login attempts found
                  </td>
                </tr>
              ) : (
                loginAttempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b border-slate-700/50">
                    <td className="py-3 px-4 text-sm text-white">{attempt.email}</td>
                    <td className="py-3 px-4 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {attempt.ip_address}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400">
                      {new Date(attempt.attempted_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        attempt.success
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {attempt.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400">
                      {attempt.success ? (
                        <span className="text-slate-500">-</span>
                      ) : (
                        <span className="text-red-400">{attempt.failure_reason || 'Unknown error'}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalAttempts > attemptsPerPage && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {((currentPage - 1) * attemptsPerPage) + 1} to {Math.min(currentPage * attemptsPerPage, totalAttempts)} of {totalAttempts} attempts
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-slate-800 text-white rounded-lg">
                Page {currentPage} of {Math.ceil(totalAttempts / attemptsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalAttempts / attemptsPerPage), p + 1))}
                disabled={currentPage >= Math.ceil(totalAttempts / attemptsPerPage)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
