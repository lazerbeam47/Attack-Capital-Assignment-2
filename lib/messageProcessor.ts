/**
 * Scheduled message processor utility
 * Separated from API route for reuse in scheduler
 */
import { prisma } from "@/lib/db";
import { sendMessage } from "@/lib/integrations";

export async function processScheduledMessages() {
  const now = new Date();
  let processed = 0;
  let failed = 0;

  try {
    // Get pending scheduled messages from the new ScheduledMessage table
    const pendingMessages = await prisma.scheduledMessage.findMany({
      where: {
        status: "PENDING",
        scheduledFor: {
          lte: now
        }
      },
      include: {
        contact: true,
        user: true,
      },
      take: 50, // Process max 50 at a time
    });

    console.log(`Processing ${pendingMessages.length} scheduled messages`);

    for (const message of pendingMessages) {
      try {
        // Determine recipient based on channel
        let to: string;
        switch (message.channel) {
          case "SMS":
          case "WHATSAPP":
            if (!message.contact.phone) {
              throw new Error("Contact has no phone number");
            }
            to = message.contact.phone;
            break;
          case "EMAIL":
            if (!message.contact.email) {
              throw new Error("Contact has no email");
            }
            to = message.contact.email;
            break;
          default:
            throw new Error(`Unsupported channel: ${message.channel}`);
        }

        // Send the message
        const result = await sendMessage(message.channel, {
          to,
          body: message.body,
        });

        // Update scheduled message as sent
        await prisma.scheduledMessage.update({
          where: { id: message.id },
          data: { 
            status: "SENT",
            sentAt: new Date(),
          },
        });

        // Create message record in the main messages table
        await prisma.message.create({
          data: {
            contactId: message.contactId,
            userId: message.userId,
            channel: message.channel as any,
            direction: "OUTBOUND",
            status: "SENT",
            body: message.body,
            htmlBody: message.htmlBody,
            externalId: result.id,
            sentAt: new Date(),
            metadata: JSON.stringify({ 
              to,
              scheduledMessageId: message.id,
              autoSent: true,
            }),
          },
        });

        processed++;
        console.log(`✅ Sent scheduled message ${message.id} to ${to}`);
      } catch (error: any) {
        // Mark as failed
        await prisma.scheduledMessage.update({
          where: { id: message.id },
          data: { 
            status: "FAILED",
            errorMessage: error.message,
          },
        });

        failed++;
        console.error(`❌ Failed to send scheduled message ${message.id}:`, error.message);
      }
    }

    return {
      total: pendingMessages.length,
      processed,
      failed,
      timestamp: now.toISOString(),
    };
  } catch (error) {
    console.error("Error processing scheduled messages:", error);
    throw error;
  }
}
