import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  getClientInfo,
  logLoginAttempt,
  checkAccountLockout,
  getRecentFailedAttempts,
  getSecurityConfig,
  lockAccount,
  sendTelegramNotification,
} from '../utils/securityHelpers';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    setLoading(true);

    try {
      const clientInfo = await getClientInfo();

      const lockoutStatus = await checkAccountLockout(email);
      if (lockoutStatus.isLocked && lockoutStatus.unlockAt) {
        const minutesLeft = Math.ceil(
          (lockoutStatus.unlockAt.getTime() - Date.now()) / 60000
        );
        throw new Error(
          `Account is locked due to multiple failed login attempts. Try again in ${minutesLeft} minutes.`
        );
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        await logLoginAttempt({
          email,
          ip_address: clientInfo.ip_address,
          user_agent: clientInfo.user_agent,
          success: false,
          failure_reason: authError.message,
        });

        const failedAttempts = await getRecentFailedAttempts(email);
        const config = await getSecurityConfig();

        if (failedAttempts % 3 === 0) {
          await sendTelegramNotification({
            type: 'failed_login',
            email,
            ip_address: clientInfo.ip_address,
            details: `${failedAttempts} failed attempts in the last hour`,
          });
        }

        if (failedAttempts >= config.max_failed_attempts) {
          await lockAccount(email, failedAttempts, clientInfo.ip_address);
          throw new Error(
            `Account locked after ${config.max_failed_attempts} failed attempts. You will receive a notification via Telegram.`
          );
        }

        throw authError;
      }

      await logLoginAttempt({
        email,
        ip_address: clientInfo.ip_address,
        user_agent: clientInfo.user_agent,
        success: true,
      });

      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-slate-400 text-sm mt-2">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''}
                onChange={(token) => {
                  setCaptchaToken(token);
                  setError('');
                }}
                onExpired={() => setCaptchaToken(null)}
                theme="dark"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <button
              onClick={() => navigate('/')}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
