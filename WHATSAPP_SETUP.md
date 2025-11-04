# WhatsApp Setup Guide

## ❌ Current Error
You're getting "Twilio could not find a Channel with the specified From address" because your WhatsApp channel isn't properly configured.

## 🔧 Quick Fixes

### Option 1: WhatsApp Sandbox (Easiest for Testing)

1. **Join the Sandbox**:
   - Send `join <your-sandbox-keyword>` to `+1 415 523 8886` from your test phone
   - Default keyword is usually something like "join <random-words>"

2. **Find Your Sandbox Settings**:
   ```bash
   # Go to: https://console.twilio.com/us1/develop/sms/whatsapp/sandbox
   # Copy your sandbox WhatsApp number
   ```

3. **Update Your Environment**:
   ```bash
   # In .env.local, update:
   TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
   # OR use your specific sandbox number from Twilio Console
   ```

### Option 2: WhatsApp Business Account (Production)

1. **Apply for WhatsApp Business**:
   - Go to Twilio Console → WhatsApp → Getting Started
   - Submit business verification documents
   - Wait for approval (can take several days)

2. **Configure Your Business Number**:
   ```bash
   # Update .env.local with your approved business number:
   TWILIO_WHATSAPP_NUMBER="whatsapp:+1234567890"
   ```

## 🧪 Testing WhatsApp

### With Sandbox:
1. Join sandbox: Send `join <keyword>` to `+1 415 523 8886`
2. Test in app: Send WhatsApp message to your phone number
3. Expected: Message should arrive on WhatsApp

### Debugging:
```bash
# Check Twilio Console logs:
# https://console.twilio.com/us1/monitor/logs/errors

# Common issues:
# - Recipient hasn't joined sandbox
# - Wrong WhatsApp number format
# - Missing "whatsapp:" prefix
```

## 📱 Recipient Phone Number Format

## Test Configuration

**IMPORTANT:** Replace the example phone number with YOUR actual phone number for testing!

Your contact phone number should be: `+1YOURNUMBER` (replace with your actual number)
WhatsApp will send to: `whatsapp:+1YOURNUMBER`

Example if your number is +1-234-567-8900:
```javascript
// In your code or tests:
const yourPhone = "+12345678900"; // Your actual phone number in E.164 format
# Your phone: +12345678900
```

## 🔍 Current Configuration

```bash
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"  # Sandbox number
# Replace +19876543210 with YOUR phone number in the code
```

## ✅ Verification Steps

1. **Check Twilio Console**: Verify sandbox is active
2. **Join Sandbox**: Send join message from target phone
3. **Test Message**: Try sending through the app
4. **Check Logs**: Monitor for detailed error messages

## 🆘 Still Having Issues?

1. **Verify Environment Variables**: Check all Twilio credentials
2. **Check Twilio Balance**: Ensure account has credits
3. **Review Logs**: Check both app logs and Twilio Console
4. **Contact Support**: Include error codes and logs

## 📚 Resources

- [Twilio WhatsApp Sandbox](https://www.twilio.com/docs/whatsapp/sandbox)
- [WhatsApp Business API](https://www.twilio.com/docs/whatsapp/api)
- [Error Code 63007](https://www.twilio.com/docs/errors/63007)
