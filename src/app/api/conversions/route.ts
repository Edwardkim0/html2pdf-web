import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversions, documents } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import crypto from "crypto";

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

// POST: 변환 로그 기록 (공개)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename, sizeBytes, layoutType, documentId } = body;

    if (!filename || !layoutType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = hashIp(ip);

    await db.insert(conversions).values({
      filename,
      sizeBytes: sizeBytes || 0,
      layoutType,
      documentId: documentId || null,
      ipHash,
    });

    // 문서가 있으면 변환 횟수 증가
    if (documentId) {
      await db
        .update(documents)
        .set({ conversionCount: sql`${documents.conversionCount} + 1` })
        .where(eq(documents.id, documentId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Conversion log error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// GET: 변환 목록 (관리자 전용)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  try {
    const rows = await db
      .select()
      .from(conversions)
      .orderBy(desc(conversions.convertedAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversions);

    return NextResponse.json({
      data: rows,
      total: Number(count),
      page,
      totalPages: Math.ceil(Number(count) / limit),
    });
  } catch (error) {
    console.error("Conversion list error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
