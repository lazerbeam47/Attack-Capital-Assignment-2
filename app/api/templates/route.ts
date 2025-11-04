/**
 * Message Templates API
 * Handles CRUD operations for message templates and auto-scheduling
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { z } from "zod";

// Template creation schema
const CreateTemplateSchema = z.object({
  name: z.string().min(1),
  body: z.string().min(1),
  htmlBody: z.string().optional(),
  channel: z.enum(["SMS", "EMAIL", "WHATSAPP"]),
  triggerType: z.enum(["TIME_BASED", "EVENT_BASED"]).default("TIME_BASED"),
  delayDays: z.number().min(1).max(365).optional(),
});

// Schedule message schema
const ScheduleMessageSchema = z.object({
  contactId: z.string(),
  templateId: z.string().optional(),
  channel: z.enum(["SMS", "EMAIL", "WHATSAPP"]),
  body: z.string().min(1),
  htmlBody: z.string().optional(),
  scheduledFor: z.string().datetime(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.messageTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { scheduledMessages: true }
        }
      }
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Get templates error:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action;

    if (action === "schedule") {
      // Schedule a message
      const data = ScheduleMessageSchema.parse(body);
      
      const scheduledMessage = await prisma.scheduledMessage.create({
        data: {
          contactId: data.contactId,
          userId: session.user.id,
          templateId: data.templateId,
          channel: data.channel,
          body: data.body,
          htmlBody: data.htmlBody,
          scheduledFor: new Date(data.scheduledFor),
        },
        include: {
          contact: true,
          template: true,
        }
      });

      return NextResponse.json({ scheduledMessage }, { status: 201 });
    } else {
      // Create a template
      const data = CreateTemplateSchema.parse(body);
      
      const template = await prisma.messageTemplate.create({
        data: {
          name: data.name,
          body: data.body,
          htmlBody: data.htmlBody,
          channel: data.channel,
          triggerType: data.triggerType,
          delayDays: data.delayDays,
        },
      });

      return NextResponse.json({ template }, { status: 201 });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Create template/schedule message error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = CreateTemplateSchema.partial().parse(body);

    const template = await prisma.messageTemplate.update({
      where: { id },
      data,
    });

    return NextResponse.json({ template });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Update template error:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Template ID required" }, { status: 400 });
    }

    // Soft delete by setting isActive to false
    await prisma.messageTemplate.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete template error:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
