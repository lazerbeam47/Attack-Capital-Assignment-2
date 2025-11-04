# Architecture Documentation

## 📐 System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌────────────┬──────────────┬─────────────┬──────────────┐ │
│  │   Inbox    │  Analytics   │   Settings  │  Auth Pages  │ │
│  └────────────┴──────────────┴─────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                      │
│  ┌────────────┬──────────────┬─────────────┬──────────────┐ │
│  │ Messages   │  Contacts    │ Analytics   │  Webhooks    │ │
│  └────────────┴──────────────┴─────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                     │
│  ┌────────────┬──────────────┬─────────────┬──────────────┐ │
│  │Integration │   Auth       │   Session   │  Scheduler   │ │
│  │  Factory   │   (Better)   │   Manager   │  Service     │ │
│  └────────────┴──────────────┴─────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer (Prisma)                │
│                    Database: SQLite/PostgreSQL               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌────────────┬──────────────┬─────────────┬──────────────┐ │
│  │  Twilio    │   Resend     │   OAuth     │   Webhooks   │ │
│  │ SMS/WhatsApp│   Email     │  Providers  │  (Inbound)   │ │
│  └────────────┴──────────────┴─────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Design Patterns

### 1. Factory Pattern - Channel Integrations

**Purpose**: Abstract creation of channel-specific message senders

**Implementation**:
```typescript
// lib/integrations.ts
export function createSender(channel: string): Sender {
  switch (channel) {
    case "SMS": return new TwilioSMSSender();
    case "WHATSAPP": return new TwilioWhatsAppSender();
    case "EMAIL": return new EmailSender();
    default: throw new Error(`Unsupported channel: ${channel}`);
  }
}
```

**Benefits**:
- Easy to add new channels without modifying core logic
- Consistent interface across all channels
- Centralized error handling and validation

### 2. Singleton Pattern - Database Client

**Purpose**: Ensure single Prisma Client instance in development

**Implementation**:
```typescript
// lib/db.ts
const globalForPrisma = globalThis as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Benefits**:
- Prevents connection pool exhaustion during hot reloading
- Maintains single connection in serverless environments
- Optimizes resource usage

### 3. Repository Pattern - Data Access

**Purpose**: Abstract database operations

**Implementation**:
```typescript
// Centralized through Prisma
await prisma.message.create({ data: { ... } });
await prisma.contact.findMany({ where: { ... } });
```

**Benefits**:
- Type-safe database queries
- Easy to mock for testing
- Consistent data access patterns

### 4. Strategy Pattern - Message Validation

**Purpose**: Different validation strategies per channel

**Implementation**:
```typescript
interface Sender {
  validate(payload: MessagePayload): boolean;
  send(payload: MessagePayload): Promise<Result>;
}

class TwilioSMSSender implements Sender {
  validate(payload) {
    return /^\+[1-9]\d{1,14}$/.test(payload.to); // E.164
  }
}

class EmailSender implements Sender {
  validate(payload) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.to);
  }
}
```

## 🔧 Key Technologies

### Frontend
- **Next.js 14+**: App Router for server components and streaming
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Consistent iconography

### Backend
- **Next.js API Routes**: Serverless-ready API endpoints
- **Prisma ORM**: Type-safe database access
- **Better Auth**: Modern authentication with session management
- **Zod**: Runtime schema validation

### Integrations
- **Twilio**: SMS and WhatsApp messaging
- **Resend**: Transactional email (optional)
- **Google OAuth**: Social authentication (optional)

### Database
- **SQLite**: Development and testing
- **PostgreSQL**: Production (recommended)

## 📊 Data Flow

### Outbound Message Flow
```
1. User → MessageComposer Component
2. Component → POST /api/messages
3. API Route → Validates with Zod schema
4. API Route → Creates sender via Factory
5. Sender → Calls external API (Twilio/Resend)
6. API Route → Saves message to database
7. API Route → Returns result to client
```

### Inbound Message Flow (Webhooks)
```
1. Twilio → POST /api/webhooks/twilio
2. Webhook → Validates Twilio signature
3. Webhook → Extracts message data
4. Webhook → Finds or creates contact
5. Webhook → Saves message to database
6. Webhook → Updates contact status
7. Webhook → Returns TwiML response
```

### Scheduled Message Flow
```
1. User → Schedules message for future
2. API → Saves to ScheduledMessage table
3. Cron/Background Job → Checks for due messages
4. Job → Sends via appropriate channel
5. Job → Updates status in database
```

## 🔐 Security Considerations

### Authentication
- **Better Auth**: Handles password hashing, session management
- **Session tokens**: HTTP-only cookies for CSRF protection
- **Role-based access**: VIEWER, EDITOR, ADMIN roles

### Data Protection
- **Input validation**: Zod schemas on all API endpoints
- **SQL injection**: Prevented by Prisma's parameterized queries
- **XSS**: React's automatic escaping + Content Security Policy

### API Security
- **Webhook validation**: Twilio signature verification (prod)
- **Rate limiting**: TODO - implement per-user limits
- **CORS**: Next.js default (same-origin only)

### Secrets Management
- **Environment variables**: `.env.local` for sensitive data
- **Never commit**: `.gitignore` includes `.env*`
- **Production**: Use platform secrets (Vercel, Railway, etc.)

## 📈 Performance Optimizations

### Database
- **Indexes**: On frequently queried fields (phone, email, externalId)
- **Connection pooling**: Managed by Prisma
- **Efficient queries**: Only select needed fields

### Caching
- **React Query**: Client-side caching with stale-while-revalidate
- **Next.js**: Automatic static optimization for pages
- **API Routes**: Can add Redis caching layer

### Asset Optimization
- **Next.js Image**: Automatic image optimization
- **Code splitting**: Automatic with Next.js App Router
- **Tree shaking**: Removes unused code in production

## 🧪 Testing Strategy

### Unit Tests
- **Business logic**: Integration factories, validators
- **Utilities**: Date formatters, string helpers
- **Tools**: Jest, Vitest

### Integration Tests
- **API routes**: Test with mock database
- **Webhook handlers**: Test with mock Twilio payloads
- **Tools**: Supertest, Prisma mock

### E2E Tests
- **User flows**: Login, send message, view analytics
- **Tools**: Playwright, Cypress

## 🚀 Deployment Architecture

### Recommended Stack
```
┌─────────────────────────────────────────┐
│  Vercel (Frontend + API Routes)         │
│  - Automatic scaling                     │
│  - Edge functions for low latency       │
│  - Environment variable management      │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Supabase / Railway (PostgreSQL)        │
│  - Managed database                      │
│  - Automatic backups                     │
│  - Connection pooling                    │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  External Services                       │
│  - Twilio (SMS/WhatsApp)                │
│  - Resend (Email)                        │
│  - OAuth Providers                       │
└─────────────────────────────────────────┘
```

### Environment-Specific Configs

**Development**:
- SQLite database (file-based)
- Hot module reloading
- Detailed logging
- Mock external services (optional)

**Staging**:
- PostgreSQL database
- Production-like environment
- Test webhooks with ngrok/localtunnel
- Twilio sandbox mode

**Production**:
- PostgreSQL with connection pooling
- Optimized builds
- Error tracking (Sentry)
- Production Twilio numbers

## 📝 Code Organization

### File Structure Philosophy
- **Co-location**: Related code lives together
- **Feature folders**: Group by feature, not by type
- **Shared utilities**: In `/lib` for cross-cutting concerns
- **API routes**: Mirror frontend page structure

### Naming Conventions
- **Components**: PascalCase (`MessageComposer.tsx`)
- **Utilities**: camelCase (`sendMessage.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Database models**: PascalCase matching Prisma schema

## 🔄 Development Workflow

### Local Development
```bash
1. npm install              # Install dependencies
2. npm run db:generate      # Generate Prisma Client
3. npm run db:migrate       # Create/apply migrations
4. npm run dev              # Start dev server
```

### Database Changes
```bash
1. Edit prisma/schema.prisma
2. npm run db:migrate       # Creates migration
3. Git commit migration files
```

### Adding New Channel
```bash
1. Create sender class in lib/integrations.ts
2. Implement Sender interface
3. Add to createSender factory
4. Update Channel enum
5. Add UI option in MessageComposer
6. Test with mock/sandbox
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Guides](https://www.prisma.io/docs)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Twilio API Reference](https://www.twilio.com/docs/api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
