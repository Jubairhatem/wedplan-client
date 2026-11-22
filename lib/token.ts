import jwt from "jsonwebtoken";
import { auth } from "@/lib/auth";

/**
 * Creates a signed JWT for the Express backend
 */
export function createBackendTokenForUser(user: {
  id: string;
  email: string;
  role?: string;
}): string | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not configured");
    return null;
  }

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role || "customer",
  };

  return jwt.sign(payload, secret, { expiresIn: "1h" });
}

/**
 * Retrieves the session and signs a backend JWT using the incoming request headers
 */
export async function getBackendToken(
  headersList: Headers
): Promise<string | null> {
  try {
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session || !session.user) {
      return null;
    }

    return createBackendTokenForUser(session.user as { id: string; email: string; role?: string });
  } catch (error) {
    console.error("Failed to generate backend token:", error);
    return null;
  }
}
