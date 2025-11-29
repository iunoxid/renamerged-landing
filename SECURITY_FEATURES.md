# Security Features Documentation

## Overview
Comprehensive security system implemented to protect admin access and monitor suspicious activities.

## Features Implemented

### 1. Login Attempt Tracking
- **Database**: `login_attempts` table
- **What it does**:
  - Logs every login attempt (successful or failed)
  - Tracks IP address, user agent, timestamp
  - Stores failure reason for debugging
- **Location**: Runs automatically on every login

### 2. Account Lockout System
- **Database**: `account_lockouts` table
- **Configuration** (default):
  - Max failed attempts: **5 attempts**
  - Lockout duration: **60 minutes**
  - Auto-unlock after duration expires
- **What it does**:
  - Locks account after reaching max failed attempts
  - Sends Telegram notification when locked
  - Can be manually unlocked from admin dashboard

### 3. Telegram Notifications
- **Edge Function**: `send-telegram-notification`
- **Notification types**:
  - ⚠️ Every 3 failed login attempts
  - 🔒 Account locked
  - 🔓 Manual unlock by admin
  - 🚨 Suspicious activity
- **Setup Required**:
  1. Create bot via @BotFather on Telegram
  2. Get bot token
  3. Get your chat ID from @userinfobot
  4. Configure in Admin Dashboard > Security tab

### 4. Password Strength Validation
- **Requirements** (enforced at login):
  - Minimum **10 characters**
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character

### 5. Session Management
- **Database**: `active_sessions` table
- **Features**:
  - View all active sessions
  - See IP address, device, browser info
  - Session timeout: **30 minutes** of inactivity
  - Force logout from other devices
  - Terminate specific sessions

### 6. Security Dashboard
- **Access**: Admin Dashboard > Security tab
- **Features**:
  - Real-time statistics (failed attempts, successful logins, locked accounts)
  - Recent login attempts table (last 50)
  - Locked accounts list with unlock button
  - Security settings configuration
  - Telegram bot configuration

## Admin Panel Usage

### Setting Up Telegram Notifications

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` and follow instructions
3. Copy the bot token (format: `123456:ABC-DEF...`)
4. Search for **@userinfobot** and start it
5. Copy your Chat ID (numbers only)
6. Go to Admin Dashboard > Security tab
7. Paste Bot Token and Chat ID
8. Click "Save Settings"
9. **Important**: Start a conversation with your bot first!

### Unlocking Locked Accounts

1. Go to Admin Dashboard > Security tab
2. Scroll to "Locked Accounts" section
3. Click "Unlock" button next to the account
4. Telegram notification will be sent

### Managing Active Sessions

1. Go to Admin Dashboard > Sessions tab
2. View all active sessions
3. Click X button to terminate specific session
4. Or click "Terminate All Other Sessions" to logout from all devices except current

## Security Best Practices

### Current Protection
✅ Cloudflare 5-second challenge (DDoS protection)
✅ Login attempt tracking
✅ Account lockout after 5 failed attempts
✅ Telegram notifications for security events
✅ Strong password requirements
✅ Session management
✅ Row Level Security (RLS) on all tables

### Additional Recommendations
1. **2FA/MFA** - Consider adding two-factor authentication
2. **IP Whitelist** - Restrict admin access to specific IPs
3. **Regular Monitoring** - Check Security Dashboard regularly
4. **Password Rotation** - Change admin password periodically

## Database Tables

### login_attempts
Stores all login attempts for audit trail
```sql
- id (uuid)
- email (text)
- ip_address (text)
- user_agent (text)
- success (boolean)
- failure_reason (text)
- attempted_at (timestamptz)
```

### account_lockouts
Tracks locked accounts
```sql
- id (uuid)
- email (text, unique)
- locked_at (timestamptz)
- unlock_at (timestamptz)
- failed_attempts (integer)
- is_locked (boolean)
- locked_by (text)
```

### active_sessions
Manages user sessions
```sql
- id (uuid)
- user_id (uuid)
- session_token (text, unique)
- ip_address (text)
- user_agent (text)
- last_activity (timestamptz)
- created_at (timestamptz)
- expires_at (timestamptz)
```

### security_config
Security configuration
```sql
- id (uuid)
- telegram_bot_token (text)
- telegram_chat_id (text)
- max_failed_attempts (integer, default: 5)
- lockout_duration_minutes (integer, default: 60)
- session_timeout_minutes (integer, default: 30)
```

## Security Flow

### Login Flow
```
1. User enters credentials
2. Check if account is locked
   - If locked and not expired: Show error
   - If locked and expired: Auto-unlock
3. Attempt login
4. Log attempt to database
5. If failed:
   - Count recent failed attempts
   - If >= 3: Send Telegram notification
   - If >= 5: Lock account + Send notification
6. If success: Log and redirect to dashboard
```

### Auto-Unlock Flow
```
1. Cron job or manual check
2. Find locked accounts where unlock_at < now
3. Set is_locked = false
4. User can login again
```

## Troubleshooting

### Telegram Notifications Not Working
1. Verify bot token is correct
2. Verify chat ID is correct
3. Make sure you started conversation with bot
4. Check edge function logs in Supabase

### Account Locked But Can't Unlock
1. Go to Security Dashboard
2. Check "Locked Accounts" section
3. Click Unlock button
4. If error persists, check database directly

### Sessions Not Showing
1. Check if user is logged in
2. Verify RLS policies are correct
3. Check active_sessions table in database

## Security Metrics

Monitor these metrics regularly:
- **Failed Login Rate**: High rate indicates potential attack
- **Locked Accounts**: Should be low unless under attack
- **Session Count**: Monitor for suspicious multiple sessions
- **Login Attempt Patterns**: Look for unusual times or IPs
