/**
 * Analytics API - Metrics and insights
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Channel, MessageStatus, Direction } from "@/lib/enums";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate);
    }

    // Total messages
    const totalMessages = await prisma.message.count({ where: dateFilter });

    // Messages by channel
    const messagesByChannel = await prisma.message.groupBy({
      by: ["channel"],
      where: dateFilter,
      _count: true,
    });

    // Messages by status
    const messagesByStatus = await prisma.message.groupBy({
      by: ["status"],
      where: dateFilter,
      _count: true,
    });

    // Messages by direction
    /**
 * Analytics API - Metrics and insights
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Channel, MessageStatus, Direction } from "@/lib/enums";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate);
    }

    // Total messages
    const totalMessages = await prisma.message.count({ where: dateFilter });

    // Messages by channel
    const messagesByChannel = await prisma.message.groupBy({
      by: ["channel"],
      where: dateFilter,
      _count: true,
    });

    // Messages by status
    const messagesByStatus = await prisma.message.groupBy({
      by: ["status"],
      where: dateFilter,
      _count: true,
    });

    // Inbound and outbound counts
    const inboundMessages = await prisma.message.count({
      where: { ...dateFilter, direction: "INBOUND" },
    });

    const outboundMessages = await prisma.message.count({
      where: { ...dateFilter, direction: "OUTBOUND" },
    });

    // Active contacts (contacts with messages in the date range)
    const activeContacts = await prisma.contact.count({
      where: {
        messages: {
          some: dateFilter,
        },
      },
    });

    // Daily message volume (simplified)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const dailyMessages = await prisma.message.findMany({
      where: {
        createdAt: {
          gte: last30Days,
        },
      },
      select: {
        createdAt: true,
        direction: true,
      },
    });

    // Group messages by date
    const dailyVolume = dailyMessages.reduce((acc: any[], message) => {
      const date = message.createdAt.toISOString().split('T')[0];
      const existing = acc.find(item => item.date === date);
      
      if (existing) {
        existing.count++;
        if (message.direction === 'INBOUND') existing.inbound++;
        if (message.direction === 'OUTBOUND') existing.outbound++;
      } else {
        acc.push({
          date,
          count: 1,
          inbound: message.direction === 'INBOUND' ? 1 : 0,
          outbound: message.direction === 'OUTBOUND' ? 1 : 0,
        });
      }
      
      return acc;
    }, []);

    // Channel performance (delivery rates)
    const channelPerformance = await prisma.message.groupBy({
      by: ["channel", "status"],
      where: dateFilter,
      _count: true,
    });

    // Total contacts
    const totalContacts = await prisma.contact.count();

    return NextResponse.json({
      overview: {
        totalMessages,
        inboundCount: inboundMessages,
        outboundCount: outboundMessages,
        totalContacts,
        activeContacts,
        avgResponseTimeSeconds: 0, // Simplified for now
      },
      byChannel: messagesByChannel.map((item) => ({
        channel: item.channel,
        count: item._count,
      })),
      byStatus: messagesByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      dailyVolume: dailyVolume.slice(0, 30).reverse(),
      channelPerformance: channelPerformance.map((item) => ({
        channel: item.channel,
        status: item.status,
        count: item._count,
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

    // Response time calculation (simplified for SQLite)
    const responseTime = 0; // Will implement this later with proper calculations

    // Daily message volume (simplified for SQLite)
    const dailyVolume = await prisma.message.groupBy({
      by: ["createdAt"],
      where: dateFilter,
      _count: {
        _all: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    });

    // Process daily volume to group by date
    const processedDailyVolume = dailyVolume.map((item) => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count._all,
      inbound: 0, // Will calculate separately
      outbound: 0, // Will calculate separately
    }));

    // Get inbound/outbound counts separately
    const inboundCount = await prisma.message.count({
      where: { ...dateFilter, direction: "INBOUND" },
    });

    const outboundCount = await prisma.message.count({
      where: { ...dateFilter, direction: "OUTBOUND" },
    });

    // Channel performance (delivery rates)
    const channelPerformance = await prisma.message.groupBy({
      by: ["channel", "status"],
      where: {
        ...dateFilter,
        direction: Direction.OUTBOUND,
      },
      _count: true,
    });

    // Active contacts
    const activeContacts = await prisma.contact.count({
      where: {
        messages: {
          some: dateFilter,
        },
      },
    });

    // Total contacts
    const totalContacts = await prisma.contact.count();

    return NextResponse.json({
      overview: {
        totalMessages,
        inboundCount,
        outboundCount,
        totalContacts,
        activeContacts,
        avgResponseTimeSeconds:
          responseTimesResult[0]?.avg_response_time_seconds ? Number(responseTimesResult[0].avg_response_time_seconds) : 0,
      },
      byChannel: messagesByChannel.map((item) => ({
        channel: item.channel,
        count: item._count,
      })),
      byStatus: messagesByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      dailyVolume,
      channelPerformance: channelPerformance.map((item) => ({
        channel: item.channel,
        status: item.status,
        count: item._count,
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

