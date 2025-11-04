/**
 * Temporary sign-up bypass for testing
 * This allows testing the app without Better Auth working
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 422 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        role: "VIEWER",
      },
    });

    // Create account
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: email,
        providerId: "credential",
        password: hashedPassword,
      },
    });

    // Create a simple session token
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    
    // Store session
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
    console.error("Bypass sign-up error:", error);
    return NextResponse.json(
      { error: error.message || "Sign-up failed" },
      { status: 500 }
    );
  }
}
