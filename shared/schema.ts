import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Scan table
export const scans = pgTable("scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appName: text("app_name").notNull(),
  packageName: text("package_name").notNull(),
  version: text("version").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  status: text("status").notNull(), // pending, running, complete, failed
  scanDate: timestamp("scan_date").notNull().defaultNow(),
  duration: text("duration"),
  overallScore: text("overall_score"),
});

// Finding table
export const findings = pgTable("findings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanId: varchar("scan_id").notNull().references(() => scans.id),
  microservice: text("microservice").notNull(), // apk-scanner, secret-hunter, crypto-check
  title: text("title").notNull(),
  severity: text("severity").notNull(), // critical, high, medium, low, info
  cwe: text("cwe"),
  description: text("description").notNull(),
  affectedFiles: text("affected_files").array(),
  fixSuggestion: text("fix_suggestion"),
  codeSnippet: text("code_snippet"),
});

// Insert schemas
export const insertScanSchema = createInsertSchema(scans).omit({
  id: true,
  scanDate: true,
});

export const insertFindingSchema = createInsertSchema(findings).omit({
  id: true,
});

// Types
export type Scan = typeof scans.$inferSelect;
export type InsertScan = z.infer<typeof insertScanSchema>;
export type Finding = typeof findings.$inferSelect;
export type InsertFinding = z.infer<typeof insertFindingSchema>;

// Severity type
export type Severity = "critical" | "high" | "medium" | "low" | "info";

// Scan status type
export type ScanStatus = "pending" | "running" | "complete" | "failed";
