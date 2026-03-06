import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { visits } from "@/lib/db/schema";
import crypto from "crypto";

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

// POST: 방문 기록 (공개)
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = hashIp(ip);
    const userAgent = req.headers.get("user-agent") || "";

    await db.insert(visits).values({
      ipHash,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Visit log error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
