/**
 * Messages API - Send messages across channels
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { sendMessage } from "@/lib/integrations";
import { Channel, Direction, MessageStatus } from "@/lib/enums";
import { z } from "zod";

const SendMessageSchema = z.object({
  contactId: z.string(),
  channel: z.enum(["SMS", "WHATSAPP", "EMAIL", "TWITTER", "FACEBOOK", "SLACK"]),
  body: z.string().min(1),
  htmlBody: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
  scheduledFor: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = SendMessageSchema.parse(body);

    // Get contact
    const contact = await prisma.contact.findUnique({
      where: { id: data.contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Determine recipient based on channel
    let to: string;
    switch (data.channel) {
      case "SMS":
      case "WHATSAPP":
        if (!contact.phone) {
          return NextResponse.json({ error: "Contact has no phone number" }, { status: 400 });
        }
        to = contact.phone;
        break;
      case "EMAIL":
        if (!contact.email) {
          return NextResponse.json({ error: "Contact has no email" }, { status: 400 });
        }
        to = contact.email;
        break;
      default:
        return NextResponse.json({ error: "Unsupported channel" }, { status: 400 });
    }

    // If scheduled, just save to DB
    if (data.scheduledFor) {
      const message = await prisma.message.create({
        data: {
          contactId: data.contactId,
          userId: session.user.id,
          channel: data.channel,
          direction: Direction.OUTBOUND,
          status: MessageStatus.SCHEDULED,
          body: data.body,
          htmlBody: data.htmlBody,
          mediaUrls: data.mediaUrls ? JSON.stringify(data.mediaUrls) : null,
          scheduledFor: new Date(data.scheduledFor),
          metadata: JSON.stringify({ to }),
        },
      });

      return NextResponse.json({ message }, { status: 201 });
    }

    // Send immediately
    try {
      const result = await sendMessage(data.channel, {
        to,
        body: data.body,
        mediaUrls: data.mediaUrls,
      });

      // Save to DB
      const message = await prisma.message.create({
        data: {
          contactId: data.contactId,
          userId: session.user.id,
          channel: data.channel,
          direction: Direction.OUTBOUND,
          status: result.status,
          body: data.body,
          htmlBody: data.htmlBody,
          mediaUrls: data.mediaUrls ? JSON.stringify(data.mediaUrls) : null,
          externalId: result.id,
          sentAt: new Date(),
          metadata: JSON.stringify({ to }),
        },
      });

      return NextResponse.json({ message }, { status: 201 });
    } catch (error: any) {
      // Save failed message
      const message = await prisma.message.create({
        data: {
          contactId: data.contactId,
          userId: session.user.id,
          channel: data.channel,
          direction: Direction.OUTBOUND,
          status: MessageStatus.FAILED,
          body: data.body,
          htmlBody: data.htmlBody,
          mediaUrls: data.mediaUrls ? JSON.stringify(data.mediaUrls) : null,
          errorMessage: error.message,
          metadata: JSON.stringify({ to }),
        },
      });

      return NextResponse.json(
        { error: error.message, message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("contactId");
    const channel = searchParams.get("channel");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};
    if (contactId) where.contactId = contactId;
    if (channel) where.channel = channel;
    if (status) where.status = status;

    const messages = await prisma.message.findMany({
      where,
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
        sentBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" }, // Oldest first, newest at bottom
      take: limit,
      skip: offset,
    });

    const total = await prisma.message.count({ where });

    return NextResponse.json({
      messages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

