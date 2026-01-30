import { pgTable, text, timestamp, boolean, integer, uuid, json } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  // ... existing user table
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  // New fields for Creator Profile
  username: text("username").unique(),
  bio: text("bio"),
  streamToken: text("stream_token").unique(),
});

export const creator = pgTable("creator", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id),
  username: text("username").unique().notNull(),
  name: text("name").notNull(),
  bio: text("bio"),
  image: text("image"),
  coverImage: text("cover_image"),
  streamToken: text("stream_token").unique(),
  balance: integer("balance").default(0).notNull(),
  isTtsEnabled: boolean("is_tts_enabled").default(false).notNull(),
  ttsMinAmount: integer("tts_min_amount").default(10000).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ... session, account, verification tables ... can remain unchanged in replacement if I target correctly or just overwrite if small enough.
// Actually, to overlap correctly, I will target the imports and the bottom of the file.

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id)
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt")
});

export const donation = pgTable("donation", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipientId: uuid("recipient_id").references(() => creator.id).notNull(),
  donorId: text("donor_id").references(() => user.id),
  donorName: text("donor_name").notNull(),
  donorEmail: text("donor_email"),
  amount: integer("amount").notNull(),
  message: text("message"),
  status: text("status", { enum: ["PENDING", "PAID", "FAILED", "EXPIRED"] }).default("PENDING").notNull(),
  externalId: text("external_id"), // Our Reference ID (e.g. zavo-...)
  xenditId: text("xendit_id"), // Xendit's QR ID (e.g. qr_...)
  paymentUrl: text("payment_url"), // QRIS Image URL
  qrString: text("qr_string"), // Raw QR String
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

// Logs for external payment provider raw events
export const paymentLog = pgTable("payment_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  donationId: uuid("donation_id").references(() => donation.id),
  type: text("type").notNull(), // 'QR_CREATED', 'WEBHOOK_PAID', etc.
  status: text("status").notNull(),
  provider: text("provider").default('XENDIT'),
  payload: json("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// The Source of Truth for Balance
export const ledgerTransaction = pgTable("ledger_transaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => creator.id).notNull(),
  type: text("type", { enum: ["CREDIT", "DEBIT"] }).notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  referenceId: text("reference_id"), // ID from donation, withdrawal_request, etc.
  referenceType: text("reference_type", { enum: ["DONATION", "WITHDRAWAL", "ADJUSTMENT"] }).notNull(),
  status: text("status", { enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"] }).default("COMPLETED").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const withdrawalRequest = pgTable("withdrawal_request", {
  id: uuid("id").primaryKey().defaultRandom(),
  xenditId: text("xendit_id"), // Disbursement ID from Xendit
  creatorId: uuid("creator_id").references(() => creator.id).notNull(),
  amount: integer("amount").notNull(),
  status: text("status", { enum: ["PENDING", "APPROVED", "REJECTED", "PROCESSING", "COMPLETED"] }).default("PENDING").notNull(),
  bankCode: text("bank_code").notNull(),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name").notNull(),
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

