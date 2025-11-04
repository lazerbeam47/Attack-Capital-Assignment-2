#!/usr/bin/env node
/**
 * Seed data for testing
 * This creates test contacts with your actual Twilio number
 * - +15177439437: Your Twilio number (sends messages)
 * - +19876543210: Example contact number (replace with your phone for testing)
 *
 * IMPORTANT: Replace +19876543210 with YOUR phone number to test receiving messages
 * Format: E.164 format (+[country code][number], e.g., +1234567890)
 *
 * For WhatsApp testing:
 * Your Twilio number +15177439437 will receive messages from your phone number
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedData() {
  console.log("🌱 Seeding test data...\n");

  console.log(
    "✅ Setting up contact with the number that will send you messages"
  );
  console.log("📞 Your Twilio configuration:");
  console.log(
    "   +15177439437 (Twilio number - sends messages, receives webhooks)"
  );
  console.log(
    "   +19876543210 (example contact - replace with YOUR number for testing)"
  );
  console.log("");
  console.log("   +15005550009 (Twilio test number for second contact)\n");

  try {
    // Create a test user
    const hashedPassword = await bcrypt.hash("password123", 10);

    const user = await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        id: "test-user-1",
        email: "test@example.com",
        name: "Test User",
        role: "ADMIN",
      },
    });

    console.log("✅ Created user:", user.email);

    // Create an account for credential-based auth
    const account = await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: "test@example.com",
        },
      },
      update: { password: hashedPassword },
      create: {
        id: "test-account-1",
        userId: user.id,
        accountId: "test@example.com",
        providerId: "credential",
        password: hashedPassword,
      },
    });

    console.log("✅ Created account for:", account.accountId);

    // Create test contacts
    // Contact 1: Replace this number with YOUR phone number for testing
    const contact1 = await prisma.contact.upsert({
      where: { id: "contact-1" },
      update: {
        name: "Test Contact (Your Phone)",
        phone: "+19876543210", // REPLACE with YOUR phone number to receive test messages
        email: "yourphone@example.com",
      },
      create: {
        id: "contact-1",
        name: "Test Contact (Your Phone)",
        phone: "+19876543210", // REPLACE with YOUR phone number to receive test messages
        email: "yourphone@example.com",
        tags: JSON.stringify(["customer", "vip"]),
      },
    });

    const contact2 = await prisma.contact.upsert({
      where: { id: "contact-2" },
      update: {
        name: "Test Contact 2",
        phone: "+15005550009", // Twilio test number for second contact
        email: "jane@example.com",
      },
      create: {
        id: "contact-2",
        name: "Test Contact 2",
        phone: "+15005550009", // Twilio test number for second contact
        email: "jane@example.com",
        tags: JSON.stringify(["prospect"]),
      },
    });

    console.log("✅ Created contacts:", contact1.name, "and", contact2.name);

    // Create test messages
    const messages = [
      {
        id: "msg-1",
        contactId: contact1.id,
        userId: user.id,
        channel: "SMS",
        direction: "INBOUND",
        status: "DELIVERED",
        body: "Hello! I have a question about your services.",
        metadata: JSON.stringify({ from: contact1.phone }),
      },
      {
        id: "msg-2",
        contactId: contact1.id,
        userId: user.id,
        channel: "SMS",
        direction: "OUTBOUND",
        status: "DELIVERED",
        body: "Hi John! Thanks for reaching out. How can I help you today?",
        metadata: JSON.stringify({ to: contact1.phone }),
      },
      {
        id: "msg-3",
        contactId: contact2.id,
        userId: user.id,
        channel: "EMAIL",
        direction: "INBOUND",
        status: "READ",
        body: "I'm interested in learning more about your product offerings.",
        metadata: JSON.stringify({
          from: contact2.email,
          subject: "Product Inquiry",
        }),
      },
      {
        id: "msg-4",
        contactId: contact1.id,
        userId: user.id,
        channel: "WHATSAPP",
        direction: "INBOUND",
        status: "DELIVERED",
        body: "Can we schedule a call for tomorrow?",
        metadata: JSON.stringify({ from: contact1.phone }),
      },
    ];

    for (const message of messages) {
      await prisma.message.upsert({
        where: { id: message.id },
        update: message,
        create: message,
      });
    }

    console.log("✅ Created", messages.length, "test messages");

    // Create a team
    const team = await prisma.team.upsert({
      where: { slug: "default" },
      update: {},
      create: {
        id: "team-1",
        name: "Default Team",
        slug: "default",
      },
    });

    // Add user to team
    await prisma.teamMember.upsert({
      where: {
        userId_teamId: {
          userId: user.id,
          teamId: team.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        teamId: team.id,
        role: "ADMIN",
      },
    });

    console.log("✅ Created team and added user");

    // Create some notes
    const note = await prisma.note.upsert({
      where: { id: "note-1" },
      update: {},
      create: {
        id: "note-1",
        contactId: contact1.id,
        userId: user.id,
        teamId: team.id,
        title: "Customer Info",
        content:
          "VIP customer - always respond within 1 hour. Previous purchase: $5,000 enterprise plan.",
      },
    });

    console.log("✅ Created customer note");

    console.log("\n🎉 Seed data created successfully!");
    console.log("\n📋 Test Credentials:");
    console.log("   Email: test@example.com");
    console.log("   Password: password123");
    console.log("\n🌐 Access the app at: http://localhost:3000");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedData().catch((error) => {
  console.error(error);
  process.exit(1);
});
