# Email Service Deployment Guide

This guide helps you troubleshoot and fix email service issues when deploying to cloud platforms (Render, Vercel, Railway, etc.).

## Common Issues and Solutions

### Issue 1: Email Works Locally But Not in Deployment

#### Possible Causes:
1. **Environment Variables Not Set**: Most common issue - environment variables are not configured in your deployment platform
2. **Network/Firewall Restrictions**: Cloud providers may block SMTP ports or connections
3. **Gmail Security**: Gmail may block connections from cloud provider IP addresses
4. **Connection Timeouts**: Cloud providers often have slower network connections

#### Solutions:

##### 1. Verify Environment Variables
Make sure these environment variables are set in your deployment platform:

**For Render:**
1. Go to your service dashboard
2. Click on "Environment" tab
3. Add/verify these variables:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-digit-app-password
   EMAIL_SERVICE=gmail
   NODE_ENV=production
   EMAIL_FROM_NAME=Onam Festival - MIT ADT University
   ```

**For Other Platforms:**
- Check your platform's environment variable configuration
- Ensure variables are set for the correct environment (production/staging)

##### 2. Use Gmail App Password
**Important**: You MUST use a Gmail App Password, not your regular Gmail password.

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security → 2-Step Verification (enable if not enabled)
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Generate a new app password for "Mail" and "Other (Custom name)"
5. Enter "Onam Email Service" as the name
6. Copy the 16-character password (no spaces)
7. Use this in your `EMAIL_PASSWORD` environment variable

##### 3. Check Gmail "Less Secure App Access"
Gmail no longer supports "Less Secure App Access". You MUST use:
- ✅ App Passwords (recommended)
- ✅ OAuth2 (advanced, not configured by default)

##### 4. Test Email Configuration
Use the diagnostic endpoints to check your email configuration:

```bash
# Check email configuration status
curl https://your-api-url.com/api/email-diagnostics

# Test email connection
curl https://your-api-url.com/api/test-email

# Send a test email (replace with your email)
curl -X POST https://your-api-url.com/api/test-email-send \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@example.com"}'
```

### Issue 2: Connection Timeouts

The email service now has extended timeouts for cloud environments:
- Connection timeout: 120 seconds (cloud) vs 90 seconds (local)
- Greeting timeout: 90 seconds (cloud) vs 60 seconds (local)
- Socket timeout: 180 seconds (cloud) vs 120 seconds (local)

If you still experience timeouts, try:
1. Check if your cloud provider allows outbound SMTP connections on port 587
2. Try using port 465 with SSL instead (see Alternative Configuration below)

### Issue 3: Authentication Errors

If you get `EAUTH` errors:

1. **Verify App Password**:
   - Ensure you're using a 16-character App Password
   - No spaces in the password
   - Password is from "App Passwords", not regular password

2. **Check Email Address**:
   - Ensure `EMAIL_USER` matches the Gmail account used to create the App Password
   - Format: `your-email@gmail.com` (not `your.email@gmail.com` unless that's your actual address)

3. **Regenerate App Password**:
   - Delete old app password
   - Create a new one
   - Update `EMAIL_PASSWORD` environment variable

### Issue 4: Network/Firewall Issues

Some cloud providers restrict SMTP connections. Try these alternatives:

#### Alternative Configuration 1: Port 465 with SSL
Set these environment variables:
```
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
```

#### Alternative Configuration 2: Custom SMTP
If Gmail doesn't work, use a different email service:

**For SendGrid:**
```
EMAIL_SERVICE=sendgrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

**For Mailgun:**
```
EMAIL_SERVICE=mailgun
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-mailgun-username
EMAIL_PASSWORD=your-mailgun-password
```

### Issue 5: Environment Variables Not Loading

1. **Restart Service After Setting Variables**:
   - Most platforms require a service restart after adding/changing environment variables
   - In Render: Go to "Manual Deploy" → "Deploy latest commit"

2. **Check Variable Names**:
   - Ensure variable names match exactly (case-sensitive)
   - No leading/trailing spaces

3. **Verify in Logs**:
   - Check deployment logs for email configuration messages
   - Look for: "Email configuration check:" log entry
   - Should show: `hasEmailUser: true`, `hasEmailPassword: true`

## Testing Email in Deployment

### Step 1: Check Diagnostics
```bash
curl https://your-deployed-api.com/api/email-diagnostics
```

Expected response:
```json
{
  "success": true,
  "hasEmailUser": true,
  "hasEmailPassword": true,
  "emailService": "gmail",
  "emailConfigured": true,
  "environment": "production"
}
```

### Step 2: Test Connection
```bash
curl https://your-deployed-api.com/api/test-email
```

### Step 3: Send Test Email
```bash
curl -X POST https://your-deployed-api.com/api/test-email-send \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

Check your inbox (and spam folder) for the test email.

## Platform-Specific Notes

### Render
- Environment variables are set in the dashboard under "Environment"
- Service restarts automatically after environment variable changes
- Check logs in the "Logs" tab for email-related messages

### Vercel
- Environment variables in Project Settings → Environment Variables
- Must specify environment (Production/Preview/Development)
- May have network restrictions - consider using port 465 or alternative SMTP

### Railway
- Environment variables in the service dashboard
- Variables tab allows setting per-environment variables
- Usually has good SMTP connectivity

### Heroku
- Use `heroku config:set EMAIL_USER=...` command
- Or set in dashboard under Settings → Config Vars
- May require add-ons for SMTP if restricted

## Troubleshooting Checklist

- [ ] Environment variables are set in deployment platform
- [ ] Using Gmail App Password (not regular password)
- [ ] App Password is 16 characters, no spaces
- [ ] `EMAIL_USER` matches Gmail account used for App Password
- [ ] Service has been restarted after setting environment variables
- [ ] Checked deployment logs for email configuration status
- [ ] Tested with `/api/email-diagnostics` endpoint
- [ ] Tested with `/api/test-email` endpoint
- [ ] Sent test email with `/api/test-email-send` endpoint
- [ ] Checked spam folder for test emails
- [ ] Tried alternative SMTP configuration if Gmail fails

## Getting Help

If email still doesn't work after trying all solutions:

1. **Check Logs**: Look for error messages in deployment logs
2. **Error Codes**:
   - `EAUTH`: Authentication error - check credentials
   - `ECONNECTION`: Connection error - check network/firewall
   - `ETIMEDOUT`: Timeout - try alternative configuration
3. **Test Locally**: Ensure email works locally first
4. **Use Diagnostic Endpoints**: Use the diagnostic endpoints to gather information

## Quick Fix Summary

**Most Common Fix:**
1. Generate Gmail App Password
2. Set environment variables in deployment platform:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-digit-app-password
   ```
3. Restart service
4. Test with `/api/test-email-send` endpoint

**If Gmail Still Fails:**
Try alternative SMTP service or port 465 with SSL:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
```

