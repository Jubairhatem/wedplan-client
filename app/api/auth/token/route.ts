import { NextResponse } from "next/server";
import { getBackendToken } from "@/lib/token";

export async function GET() {
  const token = await getBackendToken();
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 }
    );
  }
  return NextResponse.json({ success: true, token });
}
