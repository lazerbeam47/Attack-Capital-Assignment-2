/**
 * Authentication helper that supports both Better Auth and bypass authentication
 */
import { NextRequest } from "next/server";
import { auth } from "./auth";
import { prisma } from "./db";

export async function getSession(request: NextRequest) {
  try {
    // Try Better Auth first
    const session = await auth.api.getSession({ headers: request.headers });
    if (session) {
      return session;
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
      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        },
      };
    }
  }

  return null;
}
