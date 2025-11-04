# Testing Guide - Unified Inbox

## 🚀 Quick Test Steps

### 1. Access the Application
- Open: http://localhost:3000
- Sign up with any email/password (e.g., test@example.com / password123)

### 2. Create a Contact
Since we don't have a contact UI yet, you can create one via the browser console or API:

**Option A: Via Browser Console** (on http://localhost:3000/inbox)
```javascript
// First, get your session token (you'll need to be logged in)
fetch('/api/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Contact',
    phone: '+1234567890', // Replace with your verified Twilio number for testing
    email: 'test@example.com'
  })
}).then(r => r.json()).then(console.log)
```

**Option B: Via API directly** (replace YOUR_SESSION_TOKEN)
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_TOKEN" \
  -d '{"name":"Test Contact","phone":"+1234567890"}'
```

### 3. Send a Test SMS
Once you have a contact ID, send a message:

```javascript
// Replace CONTACT_ID with the ID from step 2
fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contactId: 'CONTACT_ID',
    channel: 'SMS',
    body: 'Hello! This is a test message from Unified Inbox!'
  })
}).then(r => r.json()).then(console.log)
```

### 4. Test WhatsApp (Sandbox Required)
For WhatsApp testing:
1. Join Twilio Sandbox: Send "join [code]" to +1 415 523 8886
2. Get the join code from: Twilio Console → Messaging → Try it out → Send a WhatsApp message
3. Once joined, you can send WhatsApp messages to your verified number

## 📱 Webhook Setup for Receiving Messages

### For Local Development:

**Option 1: Using ngrok** (Recommended)
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000

# Use the https URL shown (e.g., https://abc123.ngrok.io)
# Set webhook in Twilio Console to: https://abc123.ngrok.io/api/webhooks/twilio
```

**Option 2: Using Twilio CLI**
```bash
# Install Twilio CLI: npm install -g twilio-cli
twilio phone-numbers:update +15177439437 --sms-url http://your-url/api/webhooks/twilio
```

### In Twilio Console:
1. Go to: Phone Numbers → Manage → Active Numbers
2. Click your number: **+15177439437**
3. Under "Messaging Configuration":
   - **A MESSAGE COMES IN**: Set to `http://your-public-url/api/webhooks/twilio`
   - Save

## ✅ Testing Checklist

- [ ] Sign up / Sign in works
- [ ] Create a contact (manually via API or UI)
- [ ] Send SMS message
- [ ] View message in inbox
- [ ] Send WhatsApp message (after joining sandbox)
- [ ] Receive inbound message via webhook (if webhook configured)
- [ ] Check analytics dashboard

## 🐛 Troubleshooting

**"Twilio credentials not configured"**
- Check .env.local file has all TWILIO_* variables
- Restart the dev server

**"Invalid phone number format"**
- Use E.164 format: +1234567890 (with country code)
- For Twilio trial, you can only send to verified numbers

**"Webhook not receiving messages"**
- Make sure webhook URL is publicly accessible
- Check Twilio webhook logs in Console
- Verify the webhook endpoint responds with XML

**"WhatsApp not working"**
- Join the Twilio Sandbox first
- Use format: `whatsapp:+1234567890`
- Sandbox number: `whatsapp:+14155238886`

