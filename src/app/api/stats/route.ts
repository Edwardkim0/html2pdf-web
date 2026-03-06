import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversions, visits } from "@/lib/db/schema";
import { sql, gte } from "drizzle-orm";
import { auth } from "@/lib/auth/config";

// GET: 대시보드 통계 (관리자 전용)
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 총 변환 수
    const [{ totalConversions }] = await db
      .select({ totalConversions: sql<number>`count(*)` })
      .from(conversions);

    // 총 방문자 수 (유니크 IP)
    const [{ totalVisitors }] = await db
      .select({ totalVisitors: sql<number>`count(distinct ${visits.ipHash})` })
      .from(visits);

    // 오늘 변환 수
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [{ todayConversions }] = await db
      .select({ todayConversions: sql<number>`count(*)` })
      .from(conversions)
      .where(gte(conversions.convertedAt, today));

    // 최근 30일 일별 변환 트렌드
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrend = await db
      .select({
        date: sql<string>`to_char(${conversions.convertedAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)`,
      })
      .from(conversions)
      .where(gte(conversions.convertedAt, thirtyDaysAgo))
      .groupBy(sql`to_char(${conversions.convertedAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${conversions.convertedAt}, 'YYYY-MM-DD')`);

    // 최근 변환 10개
    const recentConversions = await db
      .select()
      .from(conversions)
      .orderBy(sql`${conversions.convertedAt} desc`)
      .limit(10);

    return NextResponse.json({
      totalConversions: Number(totalConversions),
      totalVisitors: Number(totalVisitors),
      todayConversions: Number(todayConversions),
      dailyTrend: dailyTrend.map((d) => ({
        date: d.date,
        count: Number(d.count),
      })),
      recentConversions,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
