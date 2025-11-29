import { supabase } from '../lib/supabase';

export interface LoginAttempt {
  email: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  failure_reason?: string;
}

export interface SecurityConfig {
  telegram_bot_token?: string;
  telegram_chat_id?: string;
  max_failed_attempts: number;
  lockout_duration_minutes: number;
  session_timeout_minutes: number;
}

export async function getClientInfo() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return {
      ip_address: data.ip,
      user_agent: navigator.userAgent,
    };
  } catch {
    return {
      ip_address: 'Unknown',
      user_agent: navigator.userAgent,
    };
  }
}

export async function logLoginAttempt(attempt: LoginAttempt) {
  try {
    const { error } = await supabase
      .from('login_attempts')
      .insert({
        email: attempt.email,
        ip_address: attempt.ip_address,
        user_agent: attempt.user_agent,
        success: attempt.success,
        failure_reason: attempt.failure_reason,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to log login attempt:', error);
  }
}

export async function checkAccountLockout(email: string): Promise<{
  isLocked: boolean;
  unlockAt?: Date;
}> {
  try {
    const { data, error } = await supabase
      .from('account_lockouts')
      .select('is_locked, unlock_at')
      .eq('email', email)
      .eq('is_locked', true)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      const unlockAt = new Date(data.unlock_at);
      const now = new Date();

      if (now < unlockAt) {
        return { isLocked: true, unlockAt };
      } else {
        await supabase
          .from('account_lockouts')
          .update({ is_locked: false })
          .eq('email', email);
        return { isLocked: false };
      }
    }

    return { isLocked: false };
  } catch (error) {
    console.error('Failed to check account lockout:', error);
    return { isLocked: false };
  }
}

export async function getRecentFailedAttempts(email: string): Promise<number> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count, error } = await supabase
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .eq('success', false)
      .gte('attempted_at', oneHourAgo);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Failed to get recent failed attempts:', error);
    return 0;
  }
}

export async function getSecurityConfig(): Promise<SecurityConfig> {
  try {
    const { data, error } = await supabase
      .from('security_config')
      .select('*')
      .single();

    if (error) throw error;

    return data as SecurityConfig;
  } catch (error) {
    console.error('Failed to get security config:', error);
    return {
      max_failed_attempts: 5,
      lockout_duration_minutes: 60,
      session_timeout_minutes: 30,
    };
  }
}

export async function lockAccount(email: string, failedAttempts: number, ip_address?: string) {
  try {
    const config = await getSecurityConfig();
    const unlockAt = new Date(Date.now() + config.lockout_duration_minutes * 60 * 1000);

    const { error } = await supabase
      .from('account_lockouts')
      .upsert({
        email,
        locked_at: new Date().toISOString(),
        unlock_at: unlockAt.toISOString(),
        failed_attempts: failedAttempts,
        is_locked: true,
        locked_by: 'system',
      }, {
        onConflict: 'email',
      });

    if (error) throw error;

    await sendTelegramNotification({
      type: 'account_locked',
      email,
      ip_address,
      failed_attempts: failedAttempts,
    });
  } catch (error) {
    console.error('Failed to lock account:', error);
  }
}

export async function sendTelegramNotification(payload: {
  type: 'failed_login' | 'account_locked' | 'suspicious_activity' | 'manual_unlock';
  email: string;
  ip_address?: string;
  failed_attempts?: number;
  details?: string;
}) {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-telegram-notification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send Telegram notification:', error);
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 10) {
    errors.push('Password must be at least 10 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
