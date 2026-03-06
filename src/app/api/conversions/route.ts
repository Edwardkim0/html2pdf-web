import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversions, documents } from "@/lib/db/schema";
import { desc, eq, sql, ilike } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import crypto from "crypto";

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

// POST: 변환 로그 기록 + 문서 자동 등록 (공개)
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let filename = "unknown.html";
    let sizeBytes = 0;
    let layoutType = "unknown";
    let htmlContent: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      // FormData (파일 포함)
      const formData = await req.formData();
      filename = (formData.get("filename") as string) || "unknown.html";
      sizeBytes = parseInt((formData.get("sizeBytes") as string) || "0");
      layoutType = (formData.get("layoutType") as string) || "unknown";
      const file = formData.get("file") as File | null;
      if (file) {
        htmlContent = await file.text();
        sizeBytes = file.size;
        filename = file.name;
      }
    } else {
      // JSON (이전 호환)
      const body = await req.json();
      filename = body.filename || "unknown.html";
      sizeBytes = body.sizeBytes || 0;
      layoutType = body.layoutType || "unknown";
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = hashIp(ip);

    let documentId: number | null = null;

    // 같은 파일명의 문서가 이미 있는지 확인
    const existing = await db.query.documents.findFirst({
      where: ilike(documents.filename, filename),
    });

    if (existing) {
      // 기존 문서의 변환 횟수 증가
      documentId = existing.id;
      await db
        .update(documents)
        .set({ conversionCount: sql`${documents.conversionCount} + 1` })
        .where(eq(documents.id, existing.id));
    } else if (htmlContent) {
      // 새 문서 등록 (Vercel Blob 업로드 시도)
      let blobUrl = "";
      try {
        const { put } = await import("@vercel/blob");
        const blob = await put(
          `documents/${Date.now()}-${filename}`,
          new Blob([htmlContent], { type: "text/html" }),
          { access: "public" }
        );
        blobUrl = blob.url;
      } catch {
        // Blob 토큰 없으면 URL 없이 저장
        blobUrl = "";
      }

      const [doc] = await db
        .insert(documents)
        .values({
          filename,
          sizeBytes,
          layoutType,
          blobUrl,
          conversionCount: 1,
        })
        .returning();
      documentId = doc.id;
    }

    // 변환 로그 기록
    await db.insert(conversions).values({
      filename,
      sizeBytes,
      layoutType,
      documentId,
      ipHash,
    });

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
