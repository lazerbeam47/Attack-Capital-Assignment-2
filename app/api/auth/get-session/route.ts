import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Try Better Auth first
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      if (session) {
        return NextResponse.json({ user: session.user });
      }
    } catch {
      // Better Auth failed, try bypass
    }

    // Fallback: Check bypass session
    const cookieHeader = request.headers.get("cookie");
    const sessionToken = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("better-auth.session_token="))
      ?.split("=")[1];

    if (sessionToken) {
      const decodedToken = decodeURIComponent(sessionToken);
      
      const session = await prisma.session.findUnique({
        where: { token: decodedToken },
        include: { user: true },
      });

      if (session && session.expiresAt > new Date()) {
        return NextResponse.json({
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
          },
        });
      }
    }

    return NextResponse.json({ user: null }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

