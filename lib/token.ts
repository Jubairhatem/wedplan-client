"use server";

import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Server action to generate/retrieve a JWT token for calling the Express backend
 */
export async function getBackendToken(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return null;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not configured");
      return null;
    }

    const payload = {
      userId: session.user.id,
      email: session.user.email,
      role: (session.user as any).role || "customer",
    };

    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    return token;
  } catch (error) {
    console.error("Failed to generate backend token:", error);
    return null;
  }
}
