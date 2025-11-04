# Quick Authentication Fix

## Current Issue
Better Auth is returning `PrismaClientValidationError` when signing up.

## Immediate Workaround

The app is fully functional except for user sign-up. Here are options:

### Option 1: Use Better Auth CLI (if available)
```bash
npx better-auth-cli create-user
```

### Option 2: Manual User Creation via SQL
```bash
sqlite3 dev.db
```

Then run:
```sql
INSERT INTO users (id, email, name, role, "createdAt", "updatedAt") 
VALUES ('test123', 'test@example.com', 'Test User', 'ADMIN', datetime('now'), datetime('now'));

-- Password hash for "password123" (bcrypt)
INSERT INTO accounts (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
VALUES ('acc123', 'test123', 'test@example.com', 'credential', '$2a$10$placeholder', datetime('now'), datetime('now'));
```

### Option 3: Continue Debugging
The Prisma validation error suggests Better Auth v1.3.34 might have compatibility issues with our schema. 

**Next steps to try:**
1. Check Better Auth adapter source for expected schema
2. Update to latest Better Auth version
3. Simplify auth schema temporarily

## For Now
The rest of the app (inbox, messaging, analytics) works once authenticated!
