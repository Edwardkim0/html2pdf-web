import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { desc, sql, ilike } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { put } from "@vercel/blob";

// GET: 문서 목록 (관리자 전용)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";
  const offset = (page - 1) * limit;

  try {
    const whereClause = search
      ? ilike(documents.filename, `%${search}%`)
      : undefined;

    const rows = await db
      .select()
      .from(documents)
      .where(whereClause)
      .orderBy(desc(documents.uploadedAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(whereClause);

    return NextResponse.json({
      data: rows,
      total: Number(count),
      page,
      totalPages: Math.ceil(Number(count) / limit),
    });
  } catch (error) {
    console.error("Documents list error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST: 문서 업로드 (관리자 전용)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 레이아웃 타입 감지
    const content = await file.text();
    const isSlide = /class="slide"/.test(content);
    const isTab = /class="sp"/.test(content) && /data-main=/.test(content);
    const isPage = /class="page"/.test(content) && !isTab;

    let layoutType = "unknown";
    if (isTab) layoutType = "tab";
    else if (isPage && !isSlide) layoutType = "page";
    else if (isSlide) layoutType = "slide";

    // Vercel Blob에 업로드
    const blob = await put(`documents/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    // DB에 메타데이터 저장
    const [doc] = await db
      .insert(documents)
      .values({
        filename: file.name,
        sizeBytes: file.size,
        layoutType,
        blobUrl: blob.url,
      })
      .returning();

    return NextResponse.json({ success: true, document: doc });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
