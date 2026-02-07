import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Monitor, X, Clock } from 'lucide-react';
import { useToast } from './ToastContainer';

interface ActiveSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address: string;
  user_agent: string;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('expires_at', now)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      if (data) setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('active_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      showToast('Session terminated successfully', 'success');
      loadSessions();
    } catch (error) {
      console.error('Failed to terminate session:', error);
      showToast('Failed to terminate session', 'error');
    }
  };

  const handleTerminateAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentSession = (await supabase.auth.getSession()).data.session;

      const { error } = await supabase
        .from('active_sessions')
        .delete()
        .eq('user_id', user.id)
        .neq('session_token', currentSession?.access_token || '');

      if (error) throw error;

      showToast('All other sessions terminated', 'success');
      loadSessions();
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
      showToast('Failed to terminate sessions', 'error');
    }
  };

  const getBrowserInfo = (userAgent: string): string => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const getDeviceInfo = (userAgent: string): string => {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Monitor className="w-8 h-8 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Active Sessions</h2>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={handleTerminateAll}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
          >
            Terminate All Other Sessions
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
          <Monitor className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No active sessions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sessions.map((session) => {
            const isCurrentSession = session.session_token === supabase.auth.session()?.access_token;
            return (
              <div
                key={session.id}
                className={`bg-slate-800/50 border rounded-xl p-6 ${
                  isCurrentSession ? 'border-blue-500' : 'border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">
                        {getBrowserInfo(session.user_agent)} on {getDeviceInfo(session.user_agent)}
                      </h3>
                      {isCurrentSession && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                          Current Session
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-slate-400">
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-slate-300">IP Address:</span>
                        {session.ip_address}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium text-slate-300">Last Activity:</span>
                        {new Date(session.last_activity).toLocaleString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium text-slate-300">Created:</span>
                        {new Date(session.created_at).toLocaleString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium text-slate-300">Expires:</span>
                        {new Date(session.expires_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {!isCurrentSession && (
                    <button
                      onClick={() => handleTerminateSession(session.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                      title="Terminate Session"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
