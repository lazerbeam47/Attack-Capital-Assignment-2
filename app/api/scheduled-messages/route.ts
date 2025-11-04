/**
 * Scheduled Messages API - Process scheduled messages
 * This should be called by a cron job or scheduler
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMessage } from "@/lib/integrations";
import { MessageStatus } from "@/lib/enums";

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job (add auth header check in production)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find scheduled messages that are ready to send
    const now = new Date();
    const scheduledMessages = await prisma.message.findMany({
      where: {
        status: MessageStatus.SCHEDULED,
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        contact: true,
      },
      take: 100, // Process in batches
    });

    const results = [];

    for (const message of scheduledMessages) {
      try {
        // Determine recipient based on channel
        let to: string;
        if (message.channel === "SMS" || message.channel === "WHATSAPP") {
          to = message.contact.phone || "";
        } else if (message.channel === "EMAIL") {
          to = message.contact.email || "";
        } else {
          continue; // Skip unsupported channels
        }

        if (!to) {
          await prisma.message.update({
            where: { id: message.id },
            data: {
              status: MessageStatus.FAILED,
              errorMessage: "Contact missing required contact information",
            },
          });
          continue;
        }

        // Parse mediaUrls from JSON string
        let mediaUrls: string[] = [];
        if (message.mediaUrls) {
          try {
            mediaUrls = JSON.parse(message.mediaUrls);
          } catch {
            // If not JSON, ignore
          }
        }

        // Send message
        const result = await sendMessage(message.channel as any, {
          to,
          body: message.body,
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        });

        // Update message status
        await prisma.message.update({
          where: { id: message.id },
          data: {
            status: result.status,
            externalId: result.id,
            sentAt: new Date(),
          },
        });

        results.push({ id: message.id, status: "sent" });
      } catch (error: any) {
        // Mark as failed
        await prisma.message.update({
          where: { id: message.id },
          data: {
            status: MessageStatus.FAILED,
            errorMessage: error.message,
          },
        });

        results.push({ id: message.id, status: "failed", error: error.message });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Scheduled messages error:", error);
    return NextResponse.json({ error: "Failed to process scheduled messages" }, { status: 500 });
  }
}

// Also allow GET for manual triggering (remove in production)
export async function GET(request: NextRequest) {
  return POST(request);
}

