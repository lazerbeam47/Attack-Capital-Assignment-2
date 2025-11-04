/**
 * Twilio Webhook Handler for inbound SMS/WhatsApp messages
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Channel, Direction, MessageStatus } from "@/lib/enums";
import twilio from "twilio";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body = Object.fromEntries(formData);
    
    // Verify Twilio signature (production)
    const twilioSignature = request.headers.get("x-twilio-signature");
    const url = request.url;
    
    // In development, skip signature verification
    // In production, verify: twilio.validateRequest(authToken, signature, url, body)

    const from = body.From as string;
    const to = body.To as string;
    const messageBody = body.Body as string;
    const messageSid = body.MessageSid as string;
    const numMedia = parseInt(body.NumMedia as string || "0");
    
    // Determine channel (WhatsApp or SMS)
    const isWhatsApp = from.startsWith("whatsapp:") || to.startsWith("whatsapp:");
    const channel = isWhatsApp ? Channel.WHATSAPP : Channel.SMS;

    // Extract phone number (remove whatsapp: prefix)
    const phoneNumber = from.replace(/^whatsapp:/, "");

    // Find or create contact
    let contact = await prisma.contact.findFirst({
      where: { phone: phoneNumber },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          phone: phoneNumber,
          name: phoneNumber, // Default name
          status: "LEAD",
        },
      });
    }

    // Extract media URLs if present
    const mediaUrls: string[] = [];
    if (numMedia > 0) {
      for (let i = 0; i < numMedia; i++) {
        const mediaUrl = body[`MediaUrl${i}`] as string;
        if (mediaUrl) {
          mediaUrls.push(mediaUrl);
        }
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        contactId: contact.id,
        channel,
        direction: Direction.INBOUND,
        status: MessageStatus.DELIVERED,
        body: messageBody,
        mediaUrls: mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
        externalId: messageSid,
        sentAt: new Date(),
        deliveredAt: new Date(),
        metadata: JSON.stringify({
          from,
          to,
          numMedia,
        }),
      },
    });

    // Update contact last activity
    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        updatedAt: new Date(),
        status: contact.status === "LEAD" ? "CONTACTED" : contact.status,
      },
    });

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  } catch (error) {
    console.error("Twilio webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

