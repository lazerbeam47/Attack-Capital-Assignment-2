import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

/**
 * Mark messages as read for a specific contact
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contactId } = await request.json();

    if (!contactId) {
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 });
    }

    // Mark all unread inbound messages from this contact as read
    const updatedMessages = await prisma.message.updateMany({
      where: {
        contactId,
        direction: "INBOUND",
        status: {
          in: ["DELIVERED", "SENT", "PENDING"] // Any status that isn't already READ
        }
      },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      updatedCount: updatedMessages.count 
    });

  } catch (error) {
    console.error("Mark as read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
