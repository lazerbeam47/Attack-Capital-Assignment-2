# Unified Inbox - Multi-Channel Customer Outreach Platform

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.0+-teal?style=flat-square&logo=prisma)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

A comprehensive full-stack application for unified communication across SMS, WhatsApp, Email, and Social Media channels. Built with Next.js 14+, TypeScript, Prisma, and Better Auth.

## 📹 Video Walkthrough
https://www.loom.com/share/dc5bbc31424943b69775d6286b166d5e

The video demonstrates:
1. **Cross-Channel Messaging**: Send SMS, WhatsApp, and Email messages from a unified interface
2. **Message Scheduling**: Set up automated follow-up sequences and scheduled messages
3. **Team Collaboration**: Create notes with @mentions and collaborate on contact management
4. **Analytics Dashboard**: View engagement metrics, response rates, and channel performance

*Note: Replace the placeholder link above with your actual video URL after recording.*

## 📊 Database Schema (ERD)fied Inbox - Multi-Channel Customer Outreach Platform

A comprehensive full-stack application for unified communication across SMS, WhatsApp, Email, and Social Media channels. Built with Next.js 14+, TypeScript, Prisma, and Better Auth.

## � Database Schema (ERD)

```mermaid
erDiagram
    User ||--o{ Message : sends
    User ||--o{ Note : creates
    User ||--o{ ScheduledMessage : schedules
    User ||--o{ TeamMember : "belongs to"
    User ||--o{ Session : has
    User ||--o{ Account : has
    
    Contact ||--o{ Message : receives
    Contact ||--o{ Note : "associated with"
    Contact ||--o{ ScheduledMessage : "scheduled for"
    
    Team ||--o{ TeamMember : has
    Team ||--o{ Note : owns
    
    MessageTemplate ||--o{ ScheduledMessage : uses
    
    Note ||--o{ NoteMention : contains
    User ||--o{ NoteMention : "mentioned in"
    
    User {
        string id PK
        string name
        string email UK
        datetime emailVerified
        string image
        string role
        datetime createdAt
        datetime updatedAt
    }
    
    Contact {
        string id PK
        string name
        string phone
        string email
        string twitterHandle
        string facebookId
        string avatar
        string quickNotes
        string tags
        string status
        datetime createdAt
        datetime updatedAt
    }
    
    Message {
        string id PK
        string contactId FK
        string userId FK
        string channel
        string direction
        string status
        string subject
        string body
        string htmlBody
        string mediaUrls
        datetime scheduledFor
        datetime sentAt
        datetime deliveredAt
        datetime readAt
        string externalId
        string errorMessage
        string metadata
        datetime createdAt
        datetime updatedAt
    }
    
    Note {
        string id PK
        string contactId FK
        string teamId FK
        string userId FK
        string title
        string content
        boolean isPrivate
        boolean encrypted
        datetime createdAt
        datetime updatedAt
    }
    
    Team {
        string id PK
        string name
        string slug UK
        datetime createdAt
        datetime updatedAt
    }
    
    TeamMember {
        string id PK
        string userId FK
        string teamId FK
        string role
    }
    
    MessageTemplate {
        string id PK
        string name
        string body
        string htmlBody
        string channel
        string triggerType
        int delayDays
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    ScheduledMessage {
        string id PK
        string contactId FK
        string userId FK
        string templateId FK
        string channel
        string body
        string htmlBody
        datetime scheduledFor
        string status
        datetime sentAt
        string errorMessage
        datetime createdAt
        datetime updatedAt
    }
    
    Session {
        string id PK
        string userId FK
        datetime expiresAt
        string token UK
        string ipAddress
        string userAgent
    }
    
    Account {
        string id PK
        string userId FK
        string accountId
        string providerId
        string accessToken
        string refreshToken
        datetime expiresAt
        string password
        datetime createdAt
        datetime updatedAt
    }
    
    NoteMention {
        string id PK
        string noteId FK
        string userId FK
    }
```

## �🚀 Features

- **Unified Inbox**: Centralized view of all messages across multiple channels
- **Multi-Channel Support**: SMS, WhatsApp, Email (with optional Twitter/Facebook integration)
- **Contact Management**: Unified contact profiles with history and notes
- **Message Scheduling**: Schedule messages for future delivery
- **Real-time Analytics**: Track engagement metrics, response times, and channel performance
- **Team Collaboration**: Internal notes with @mentions support
- **Role-Based Access**: Viewer, Editor, and Admin roles
- **Webhook Integration**: Receive messages from Twilio and other services

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth (Credentials + Google OAuth)
- **Integrations**: 
  - Twilio (SMS/WhatsApp)
  - Resend (Email - optional)
  - Twitter API v2 (optional)
  - Facebook Graph API (optional)
- **UI**: Tailwind CSS, React Query, Recharts
- **Code Quality**: ESLint, Prettier

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Twilio account with trial number
- (Optional) Google OAuth credentials
- (Optional) Resend API key for email

## 🔧 Setup Instructions

### Quick Start (One Command)

```bash
# Clone, install dependencies, setup database, and generate Prisma Client
npm run setup
```

Then create your `.env.local` file (see below) and run:

```bash
npm run dev
```

### Manual Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd attack-capital
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/unified_inbox?schema=public"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_BASE_PATH="/api/auth"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Twilio
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# Resend (Optional - for Email)
RESEND_API_KEY=""

# Node Environment
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 4. Twilio Configuration

1. Sign up at [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Get a trial phone number
3. For WhatsApp, join the Twilio Sandbox by sending "join [code]" to +1 415 523 8886
4. Configure webhook URL in Twilio Console:
   - SMS: `https://your-domain.com/api/webhooks/twilio`
   - WhatsApp: Same URL

### 5. Run Development Server

```bash
# Runs database generation and starts Next.js dev server
npm run dev

# Or run just the server (if Prisma Client already generated)
npm run dev:server

# Open Prisma Studio to view/edit data (optional)
npm run db:studio
```

Visit `http://localhost:3000` and sign in.

## 📝 NPM Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Generate Prisma Client and start development server |
| `npm run dev:server` | Start development server only (faster if Prisma already generated) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run setup` | Complete project setup (install + database setup) |
| `npm run db:generate` | Generate Prisma Client from schema |
| `npm run db:migrate` | Create and apply database migrations |
| `npm run db:studio` | Open Prisma Studio GUI for database management |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## 🧪 Testing with Your Phone Number

**IMPORTANT:** The project uses placeholder phone numbers (`+19876543210`) in the code. To actually test sending/receiving messages:

1. **Replace the placeholder** with YOUR phone number in `scripts/seed-data.js`
2. **Use E.164 format**: `+[country code][number]` (e.g., `+12345678900`)
3. **Re-seed the database**: `npm run db:seed`
4. **Test messaging** through the UI or API

📖 **Full guide:** See [TESTING_WITH_YOUR_PHONE.md](./TESTING_WITH_YOUR_PHONE.md) for detailed instructions.

**Examples:**
- USA: `+12345678900`
- India: `+919876543210`
- UK: `+447911123456`

This allows you to receive real SMS/WhatsApp messages on your actual phone! 📱

## 📊 Integration Comparison Table

| Channel | Latency | Cost (USD) | Reliability | Setup Complexity | Best For |
|---------|---------|-----------|-------------|-------------------|----------|
| **SMS (Twilio)** | 1-5s | $0.0075/message | ⭐⭐⭐⭐⭐ | Low | Quick notifications, 2FA |
| **WhatsApp (Twilio)** | 1-5s | $0.005-$0.01/message | ⭐⭐⭐⭐ | Medium | Rich media, international |
| **Email (Resend)** | 1-30s | $0.10/1000 emails | ⭐⭐⭐⭐ | Low | Marketing, newsletters |
| **Twitter DM** | 5-15s | Free (API limits) | ⭐⭐⭐ | High | Public engagement |
| **Facebook Messenger** | 5-15s | Free (API limits) | ⭐⭐⭐ | High | Social customer service |

### Notes:
- **Latency**: Average delivery time from send to recipient
- **Cost**: Approximate pricing (varies by region and volume)
- **Reliability**: Based on delivery rates and uptime (5 = excellent)
- **Setup Complexity**: Time required for initial integration
- Production usage may require additional verification/approval

## 🏗 Architecture Decisions

### 1. **Unified Message Model**
- Normalized all channels into a single `Message` table
- Channel-specific metadata stored in JSON field
- Enables consistent querying and analytics across channels

### 2. **Integration Factory Pattern**
- Abstract sender interface for each channel
- Easy to add new channels without modifying core logic
- Centralized error handling and validation

### 3. **Webhook-First Design**
- Inbound messages via webhooks for real-time delivery
- Polling fallback for channels without webhooks
- Secure webhook validation (implemented for production)

### 4. **Prisma ORM**
- Type-safe database queries
- Automatic migrations
- Excellent TypeScript support

### 5. **React Query**
- Optimistic updates for better UX
- Automatic caching and refetching
- Background synchronization

### 6. **Better Auth**
- Modern authentication with built-in security
- Extensible for custom roles and permissions
- Support for multiple providers

### 7. **Why SQLite for Development?**
- Zero configuration required
- Fast local development
- Easy migration to PostgreSQL for production
- Prisma provides seamless database switching

### 8. **Factory Pattern Over Hard-Coded Integrations**
- Adding new channels requires only implementing the `Sender` interface
- No changes needed to core message sending logic
- Testable in isolation with mock implementations

### 9. **JSON Metadata Field**
- Flexible schema for channel-specific data
- Avoid creating separate tables for each channel
- Easy to extend without migrations

### 10. **Scheduled Messages as First-Class Citizens**
- Dedicated `ScheduledMessage` table separate from `Message`
- Prevents cluttering main message table with undelivered items
- Easier to implement retry logic and cancellation

For more detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 📁 Project Structure

```
attack-capital/
├── app/
│   ├── api/
│   │   ├── auth/          # Better Auth endpoints
│   │   ├── webhooks/      # Twilio webhooks
│   │   ├── messages/      # Message CRUD
│   │   ├── contacts/      # Contact management
│   │   └── analytics/     # Analytics data
│   ├── inbox/             # Unified inbox page
│   ├── analytics/          # Analytics dashboard
│   └── login/             # Authentication page
├── components/
│   ├── Inbox.tsx          # Main inbox component
│   ├── MessageThread.tsx  # Message conversation view
│   ├── MessageComposer.tsx # Message sending UI
│   ├── AnalyticsDashboard.tsx # Analytics charts
│   └── Layout.tsx         # App layout with navigation
├── lib/
│   ├── auth.ts            # Better Auth configuration
│   ├── db.ts              # Prisma client singleton
│   └── integrations.ts   # Channel integration factory
├── prisma/
│   └── schema.prisma      # Database schema
└── README.md
```

## 🔐 Authentication

### Credentials
- Sign up via `/login` with email and password
- Password hashing handled by Better Auth

### Google OAuth
1. Create OAuth app at [Google Cloud Console](https://console.cloud.google.com/)
2. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Add credentials to `.env`

## 📱 API Endpoints

### Authentication

#### Get Session
```typescript
GET /api/auth/get-session
Response: { user: { id, email, name, role } }
```

#### Sign Out
```typescript
POST /api/auth/sign-out
Response: 200 OK
```

### Messages

#### Send Message
```typescript
POST /api/messages
Body: {
  contactId: string;
  channel: "SMS" | "WHATSAPP" | "EMAIL";
  body: string;
  htmlBody?: string;        // For email
  mediaUrls?: string[];     // For MMS/WhatsApp
  scheduledFor?: string;    // ISO 8601 datetime
}
Response: {
  message: {
    id: string;
    status: "PENDING" | "SENT" | "DELIVERED" | "FAILED" | "SCHEDULED";
    // ... other fields
  }
}
```

#### List Messages
```typescript
GET /api/messages?contactId={id}&channel={channel}&status={status}&limit={50}&offset={0}
Response: {
  messages: Message[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  }
}
```

### Contacts

#### Create Contact
```typescript
POST /api/contacts
Body: {
  name?: string;
  phone?: string;      // E.164 format: +1234567890
  email?: string;
  status?: "LEAD" | "CONTACTED" | "RESPONDED" | "QUALIFIED" | "CLOSED";
  quickNotes?: string;
  tags?: string;       // Comma-separated
}
Response: { contact: Contact }
```

#### List Contacts
```typescript
GET /api/contacts?search={query}&status={status}&limit={50}&offset={0}
Response: {
  contacts: Contact[];
  pagination: { total, limit, offset, hasMore }
}
```

#### Get Contact
```typescript
GET /api/contacts/{id}
Response: {
  contact: Contact & {
    messages: Message[];
    notes: Note[];
  }
}
```

#### Update Contact
```typescript
PATCH /api/contacts/{id}
Body: Partial<Contact>
Response: { contact: Contact }
```

#### Delete Contact
```typescript
DELETE /api/contacts/{id}
Response: 204 No Content
```

### Analytics

#### Get Dashboard Metrics
```typescript
GET /api/analytics?startDate={ISO8601}&endDate={ISO8601}
Response: {
  totalMessages: number;
  totalContacts: number;
  responseRate: number;
  avgResponseTime: number;  // in seconds
  messagesByChannel: { channel: string; count: number; }[];
  messagesByDay: { date: string; count: number; }[];
  topContacts: { contact: Contact; messageCount: number; }[];
}
```

### Message Templates

#### Create Template
```typescript
POST /api/templates
Body: {
  name: string;
  body: string;
  htmlBody?: string;
  channel: "SMS" | "WHATSAPP" | "EMAIL";
  triggerType?: "TIME_BASED" | "EVENT_BASED";
  delayDays?: number;
}
Response: { template: MessageTemplate }
```

#### Schedule Message from Template
```typescript
POST /api/templates
Body: {
  contactId: string;
  templateId?: string;
  channel: "SMS" | "WHATSAPP" | "EMAIL";
  body: string;
  scheduledFor: string;  // ISO 8601 datetime
}
Response: { scheduledMessage: ScheduledMessage }
```

### Webhooks

#### Twilio Inbound Messages
```typescript
POST /api/webhooks/twilio
Content-Type: application/x-www-form-urlencoded
Body: {
  From: string;          // e.g., "+1234567890" or "whatsapp:+1234567890"
  To: string;
  Body: string;
  MessageSid: string;
  NumMedia: string;
  MediaUrl0?: string;    // If NumMedia > 0
  // ... other Twilio fields
}
Response: <?xml version="1.0"?><Response></Response>
```

### Settings

#### Get User Settings
```typescript
GET /api/settings
Response: {
  twilioConfigured: boolean;
  resendConfigured: boolean;
  // ... other settings
}
```

#### Update Settings
```typescript
POST /api/settings
Body: { key: string; value: any }
Response: { success: boolean }
```

## 📱 API Endpoints (Legacy - kept for reference)

## 📱 API Endpoints (Legacy - kept for reference)

### Messages
- `GET /api/messages` - List messages (with filters)
- `POST /api/messages` - Send/schedule message

### Contacts
- `GET /api/contacts` - List contacts (with search)
- `POST /api/contacts` - Create contact

### Analytics
- `GET /api/analytics` - Get dashboard metrics

### Webhooks
- `POST /api/webhooks/twilio` - Receive SMS/WhatsApp messages

## 🏗 Architecture Overview

### Design Patterns

#### 1. Factory Pattern (Channel Senders)
```typescript
// lib/integrations.ts
const sender = createSender('WHATSAPP');
await sender.send({ to: '+1234567890', body: 'Hello!' });
```

#### 2. Singleton Pattern (Database Client)
```typescript
// lib/db.ts
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
```

#### 3. Repository Pattern (Data Access)
```typescript
// Centralized data access through Prisma
await prisma.contact.findMany({ where: { status: 'LEAD' } });
```

### Key Architecture Decisions

- [ ] Real-time WebSocket updates for collaboration
- [ ] Conflict-free editing for notes (Yjs)
- [ ] Advanced scheduling with templates
- [ ] Contact deduplication with fuzzy matching
- [ ] Encrypted private notes
- [ ] Twitter/X and Facebook integration
- [ ] HubSpot/Slack/Zapier webhooks
- [ ] In-app VoIP calling (Twilio Client SDK)
- [ ] Media upload and storage
- [ ] Export reports (CSV/PDF)

## 📝 Development Notes

### Database Migrations
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply in production
npx prisma migrate deploy
```

### Code Formatting
```bash
npm run format  # Prettier
npm run lint    # ESLint
```

## � Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update `DATABASE_URL` to use PostgreSQL (e.g., Neon, Supabase, or Railway)
5. Run `npx prisma migrate deploy` in Vercel's terminal or as a build command
6. Update `BETTER_AUTH_URL` to your production domain
7. Update Twilio webhooks to point to your production URL

### Environment Variables for Production
```env
DATABASE_URL="postgresql://..." # Use PostgreSQL in production
BETTER_AUTH_URL="https://your-domain.vercel.app"
BETTER_AUTH_SECRET="..." # Generate new secret for production
# ... other variables
```

### Database Migration to PostgreSQL
```bash
# 1. Update DATABASE_URL in .env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# 2. Push schema to new database
npx prisma db push

# 3. (Optional) Migrate data from SQLite
# Use a migration tool or manually export/import data
```

## �🐛 Troubleshooting

### Twilio Webhook Not Receiving Messages
- Verify webhook URL in Twilio Console
- Check Twilio signature validation (disabled in dev)
- Ensure ngrok or public URL for local testing

### Database Connection Issues
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL is running
- Run `npx prisma db push` to sync schema

### Authentication Errors
- Verify `BETTER_AUTH_SECRET` is set
- Check Google OAuth credentials if using social login
- Clear browser cookies and retry

## � Screenshots

_Add screenshots of your application here to showcase the UI:_
- Unified Inbox view
- Message composer with channel selection
- Analytics dashboard
- Contact management

## 🎯 Future Enhancements

- [ ] Real-time WebSocket updates for instant message delivery
- [ ] Advanced contact segmentation and filtering
- [ ] Campaign management with A/B testing
- [ ] AI-powered message suggestions and sentiment analysis
- [ ] Mobile app (React Native)
- [ ] Slack/Discord/Telegram integrations
- [ ] CRM integrations (Salesforce, HubSpot)
- [ ] Voice/video calling via WebRTC
- [ ] Multi-language support
- [ ] Advanced analytics with custom reports

## 📄 License

MIT License - feel free to use this project for learning and demonstration purposes.

## 👥 Contributing

This is a demonstration project, but contributions are welcome! Please feel free to submit issues or pull requests.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built as part of the Attack Capital technical assessment
- Powered by [Twilio](https://www.twilio.com), [Resend](https://resend.com), and [Better Auth](https://better-auth.com)
- UI inspired by modern messaging platforms

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**

