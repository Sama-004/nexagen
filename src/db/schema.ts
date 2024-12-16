import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const emails = sqliteTable("emails", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  messageId: text("message_id").unique(),
  sender: text("sender").notNull(),
  subject: text("subject"),
  timestamp: integer("timestamp").notNull(),
  processed: integer("processed", { mode: "boolean" }).default(false),
});
