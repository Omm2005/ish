import { relations } from "drizzle-orm";
import { index, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const transaction = pgTable(
  "transaction",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").default("USD").notNull(),
    type: text("type").notNull(), // "income" | "expense" (enforced in app layer)
    category: text("category"),
    note: text("note"),
    occurredAt: timestamp("occurred_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("transaction_userId_idx").on(table.userId),
    index("transaction_occurredAt_idx").on(table.occurredAt),
  ],
);

export const transactionRelations = relations(transaction, ({ one }) => ({
  user: one(user, {
    fields: [transaction.userId],
    references: [user.id],
  }),
}));
