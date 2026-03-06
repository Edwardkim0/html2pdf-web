import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { del } from "@vercel/blob";

// DELETE: 문서 삭제 (관리자 전용)
export async function DELETE(
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

    // DB에서 문서 찾기
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, docId),
    });

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Vercel Blob에서 삭제
    try {
      await del(doc.blobUrl);
    } catch (e) {
      console.warn("Blob deletion failed:", e);
    }

    // DB에서 삭제
    await db.delete(documents).where(eq(documents.id, docId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Document delete error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
