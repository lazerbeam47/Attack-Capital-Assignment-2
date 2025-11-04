# Testing with Your Own Phone Number

## 📱 How to Test with Any Phone Number

This project uses **placeholder phone numbers** in the code. You should replace them with YOUR actual phone number to test the messaging functionality.

### Default Placeholder Numbers

The following placeholder numbers are used throughout the project:
- `+19876543210` - Example contact number (REPLACE with YOUR number)
- `+15177439437` - Twilio phone number (configured in .env)

### Where to Update Your Phone Number

#### 1. Seed Data Script (`scripts/seed-data.js`)

Replace the placeholder in test contacts:

```javascript
const contact1 = await prisma.contact.upsert({
  where: { id: "contact-1" },
  update: {
    name: "Test Contact (Your Phone)",
    phone: "+19876543210", // 👈 REPLACE with YOUR phone number
    email: "yourphone@example.com",
  },
  // ...
});
```

**Example:** If your phone is +1-234-567-8900, change to:
```javascript
phone: "+12345678900", // Your actual number in E.164 format
```

#### 2. WhatsApp Setup (`WHATSAPP_SETUP.md`)

Update the test configuration section with your number.

#### 3. Simulation Scripts (`scripts/simulate-incoming-messages.js`)

Replace in the curl commands:
```bash
# Before (placeholder):
-d "From=%2B19876543210"

# After (your number, e.g., +1-234-567-8900):
-d "From=%2B12345678900"
```

### Phone Number Format (E.164)

Always use **E.164 format** for phone numbers:

| Country | Example | Format |
|---------|---------|--------|
| **USA** | (234) 567-8900 | `+12345678900` |
| **India** | 98765 43210 | `+919876543210` |
| **UK** | 7911 123456 | `+447911123456` |
| **Canada** | (416) 555-0100 | `+14165550100` |

**Format Rules:**
- ✅ Start with `+`
- ✅ Include country code (1 for USA/Canada, 91 for India, etc.)
- ✅ No spaces, dashes, or parentheses
- ✅ Only numbers after the `+`

### Testing Process

#### Step 1: Update Phone Numbers
```bash
# Edit the seed data file
nano scripts/seed-data.js

# Replace +19876543210 with YOUR phone number
# Save and exit
```

#### Step 2: Re-seed Database
```bash
# Clear existing data and reseed with your number
npm run db:seed
```

#### Step 3: Test Sending Messages

**Via UI:**
1. Login to http://localhost:3000
2. Go to Inbox
3. Select the contact with your phone number
4. Send a test SMS or WhatsApp message
5. You should receive it on your actual phone! 📱

**Via API:**
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "contact-1",
    "channel": "SMS",
    "body": "Test message to my phone!"
  }'
```

#### Step 4: Test Receiving Messages (Webhooks)

**Simulate incoming message:**
```bash
# Run the simulation script
node scripts/simulate-incoming-messages.js sms

# OR manually with curl (replace +12345678900 with YOUR number):
curl -X POST http://localhost:3000/api/webhooks/twilio \
  -d "From=%2B12345678900" \
  -d "To=%2B15177439437" \
  -d "Body=Hello%20from%20my%20phone!" \
  -d "MessageSid=SM123456"
```

### WhatsApp Testing

For WhatsApp, you need to:

1. **Join Twilio Sandbox** (one-time setup)
   - Send "join create-shown" to +1 (415) 523-8886 from your phone
   
2. **Update your phone in code**
   ```javascript
   phone: "+12345678900", // Your number that joined the sandbox
   ```

3. **Send WhatsApp message**
   - Use the UI or API with `channel: "WHATSAPP"`
   - Message will arrive on your WhatsApp! 💬

4. **Receive WhatsApp messages**
   - Send a WhatsApp message to +1 (415) 523-8886
   - It will appear in your Unified Inbox via webhook

### Common Issues

#### ❌ "Invalid phone number" error
**Solution:** Ensure E.164 format: `+[country code][number]`
```javascript
// ❌ Wrong
phone: "234-567-8900"
phone: "2345678900"

// ✅ Correct
phone: "+12345678900"
```

#### ❌ Not receiving SMS/WhatsApp
**Checklist:**
- [ ] Phone number is in E.164 format
- [ ] For WhatsApp: Joined Twilio sandbox
- [ ] Twilio credentials correct in `.env.local`
- [ ] Twilio account has credits (trial or paid)
- [ ] Phone number is verified in Twilio (for trial accounts)

#### ❌ Webhook not working
**Solutions:**
- Use ngrok or dev tunnel for public URL
- Update Twilio webhook URL in console
- Check webhook endpoint: `POST /api/webhooks/twilio`

### Example: Complete Setup

Here's a complete example if your phone is **+1-555-123-4567**:

**1. Update seed-data.js:**
```javascript
phone: "+15551234567",
```

**2. Re-seed database:**
```bash
npm run db:seed
```

**3. Send test message via UI:**
- Go to http://localhost:3000/inbox
- Select "Test Contact (Your Phone)"
- Send: "Hello from Unified Inbox!"
- Check your actual phone 📱

**4. Simulate incoming message:**
```bash
curl -X POST http://localhost:3000/api/webhooks/twilio \
  -d "From=%2B15551234567" \
  -d "To=%2B15177439437" \
  -d "Body=Reply%20from%20my%20phone" \
  -d "MessageSid=SM999"
```

---

## 🎯 Quick Reference

| Action | Command |
|--------|---------|
| Update phone number | Edit `scripts/seed-data.js` |
| Re-seed database | `npm run db:seed` |
| Test send SMS | Use UI at `/inbox` |
| Test receive SMS | `node scripts/simulate-incoming-messages.js sms` |
| Test WhatsApp | Same as SMS, use `channel: "WHATSAPP"` |
| View messages | http://localhost:3000/inbox |

---

## 📝 Notes

- **Privacy:** The placeholder number `+19876543210` is completely safe to use - it's just an example
- **Your Data:** Replace it with YOUR number to actually test the platform
- **Multiple Numbers:** You can add multiple contacts with different numbers
- **International:** Works with any country - just use correct country code

**Ready to test? Update your phone number and start sending messages!** 🚀
