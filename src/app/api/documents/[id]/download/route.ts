import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";

// GET: 문서 다운로드 (관리자 전용)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const docId = parseInt(id);

    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, docId),
    });

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Blob URL에서 파일 가져오기
    const blobRes = await fetch(doc.blobUrl);
    if (!blobRes.ok) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileContent = await blobRes.arrayBuffer();

    // format=pdf 쿼리 파라미터가 있으면 HTML 내용만 반환 (클라이언트에서 변환)
    const url = new URL(req.url);
    const format = url.searchParams.get("format");

    if (format === "content") {
      // HTML 내용을 JSON으로 반환 (PDF 변환용)
      const text = new TextDecoder().decode(fileContent);
      return NextResponse.json({ content: text, filename: doc.filename, layoutType: doc.layoutType });
    }

    // HTML 파일 다운로드 (강제 다운로드)
    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.filename)}"`,
        "Content-Length": String(fileContent.byteLength),
      },
    });
  } catch (error) {
    console.error("Document download error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
