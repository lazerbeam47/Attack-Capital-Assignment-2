# Quick Setup Guide

## ✅ Completed Setup Steps

1. ✅ Dependencies installed
2. ✅ Database schema created (SQLite for easy local development)
3. ✅ Prisma migrations run
4. ✅ Database file created: `dev.db`

## 🚀 To Start Development

1. **Set up environment variables** (create `.env` file):
```bash
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
```

2. **Start the dev server**:
```bash
DATABASE_URL="file:./dev.db" npm run dev
```

3. **Access the app**:
- Open http://localhost:3000
- Sign up with email/password
- Start using the unified inbox!

## 📝 Notes

- Database is using SQLite (file: `dev.db`) for easy local setup
- For production, switch to PostgreSQL in `prisma/schema.prisma`
- Twilio credentials needed for SMS/WhatsApp functionality
- See README.md for full documentation

## 🔧 Next Steps

1. Get Twilio account at https://www.twilio.com/try-twilio
2. Configure webhook URL in Twilio Console
3. Test sending messages!
