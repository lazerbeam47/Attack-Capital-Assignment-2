import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Try Better Auth sign-out first
    try {
      const response = await auth.api.signOut({ headers: request.headers });
      
      // If Better Auth succeeds, return its response
      if (response) {
        return response;
      }
    } catch (error) {
      console.log("Better Auth sign-out failed, falling back to manual cleanup");
    }

    // Fallback: Manually clear session from database
    const cookieHeader = request.headers.get("cookie");
    const sessionToken = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("better-auth.session_token="))
      ?.split("=")[1];

    if (sessionToken) {
      const decodedToken = decodeURIComponent(sessionToken);
      
      // Delete session from database
      await prisma.session.deleteMany({
        where: { token: decodedToken },
      });
    }

    // Clear the session cookie
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set("better-auth.session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Sign-out error:", error);
    
    // Even if there's an error, clear the cookie and return success
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set("better-auth.session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  }
}
