/**
 * 관리자 계정 시드 스크립트
 * 사용법: npx tsx scripts/seed-admin.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { admins } from "../src/lib/db/schema";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@dfinite.co";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme123!";
const ADMIN_NAME = process.env.ADMIN_NAME || "관리자";

async function seed() {
  console.log("🔧 관리자 계정 생성 중...");
  console.log(`   Email: ${ADMIN_EMAIL}`);

  const client = postgres(process.env.POSTGRES_URL!, { prepare: false });
  const db = drizzle(client);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await db.insert(admins).values({
    email: ADMIN_EMAIL,
    passwordHash,
    name: ADMIN_NAME,
  }).onConflictDoUpdate({
    target: admins.email,
    set: { passwordHash, name: ADMIN_NAME },
  });

  console.log("✅ 관리자 계정 생성 완료!");
  console.log(`   비밀번호: ${ADMIN_PASSWORD}`);
  console.log("   ⚠️  배포 후 반드시 비밀번호를 변경하세요!");

  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ 시드 실패:", err);
  process.exit(1);
});
