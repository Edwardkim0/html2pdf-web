import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

// ── Admins ──────────────────────────────────────────────
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ── Documents (HTML 파일 메타데이터) ────────────────────
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 500 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  layoutType: varchar("layout_type", { length: 20 }).notNull(),
  blobUrl: text("blob_url").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  conversionCount: integer("conversion_count").default(0).notNull(),
});

// ── Conversions (변환 로그) ─────────────────────────────
export const conversions = pgTable("conversions", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id, {
    onDelete: "set null",
  }),
  filename: varchar("filename", { length: 500 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  layoutType: varchar("layout_type", { length: 20 }).notNull(),
  convertedAt: timestamp("converted_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  ipHash: varchar("ip_hash", { length: 64 }),
});

// ── Visits (방문 기록) ──────────────────────────────────
export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  visitedAt: timestamp("visited_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  ipHash: varchar("ip_hash", { length: 64 }),
  userAgent: text("user_agent"),
});
