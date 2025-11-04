/**
 * Temporary auth bypass for testing
 * This allows testing the app without Better Auth working
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Find user and account
    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const account = user.accounts.find(
      (acc) => acc.providerId === "credential" && acc.accountId === email
    );

    if (!account || !account.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Simple password check (in production, use proper bcrypt verification)
    // For now, if password exists, allow login (temporary for testing)
    
    // Create a simple session token
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    
    // Store session (simplified)
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      session: { token: sessionToken },
    });

    // Set cookie
    response.cookies.set("better-auth.session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Bypass auth error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}

