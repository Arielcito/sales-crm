import { pgTable, text, timestamp, uuid, varchar, boolean, integer, decimal, date, foreignKey } from "drizzle-orm/pg-core";

// Teams table (referenced by users)
export const teams = pgTable("team", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  leaderId: uuid("leaderId"), // Will be set after users table is created
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Better Auth tables
export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  role: varchar("role", { length: 50 }).notNull().default("vendedor"),
  level: integer("level").notNull().default(4),
  managerId: uuid("managerId"),
  teamId: uuid("teamId").references(() => teams.id, { onDelete: "set null" }),
  banned: boolean("banned").default(false),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => ({
  managerReference: foreignKey({
    columns: [table.managerId],
    foreignColumns: [table.id],
  }).onDelete("set null"),
}));

export const sessions = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  impersonatedBy: text("impersonatedBy"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const accounts = pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  expiresAt: timestamp("expiresAt"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verifications = pgTable("verification", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// CRM specific tables
export const companies = pgTable("company", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),
  phone: varchar("phone", { length: 50 }),
  website: text("website"),
  address: text("address"),
  industry: varchar("industry", { length: 100 }),
  employeeCount: integer("employeeCount"),
  notes: text("notes"),
  createdBy: uuid("createdBy")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assignedTeamId: uuid("assignedTeamId").references(() => teams.id, { onDelete: "set null" }),
  isGlobal: boolean("isGlobal").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const contacts = pgTable("contact", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("companyId").references(() => companies.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: varchar("phone", { length: 50 }),
  position: text("position"),
  status: varchar("status", { length: 50 }).notNull().default("lead"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const dealStages = pgTable("dealStage", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  color: varchar("color", { length: 20 }).notNull().default("#3b82f6"),
  isDefault: boolean("isDefault").notNull().default(false),
  isActive: boolean("isActive").notNull().default(true),
  createdBy: uuid("createdBy").references(() => users.id, { onDelete: "set null" }),
  companyOwnerId: uuid("companyOwnerId").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const exchangeRates = pgTable("exchangeRate", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull().defaultNow(),
  usdToArs: decimal("usdToArs", { precision: 10, scale: 2 }).notNull(),
  source: varchar("source", { length: 100 }).notNull().default("manual"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const deals = pgTable("deal", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contactId: uuid("contactId").references(() => contacts.id, { onDelete: "set null" }),
  companyId: uuid("companyId").references(() => companies.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  amountUsd: decimal("amountUsd", { precision: 12, scale: 2 }),
  amountArs: decimal("amountArs", { precision: 12, scale: 2 }),
  dollarRate: decimal("dollarRate", { precision: 10, scale: 2 }),
  exchangeRateId: uuid("exchangeRateId").references(() => exchangeRates.id, { onDelete: "set null" }),
  stageId: uuid("stageId")
    .notNull()
    .references(() => dealStages.id, { onDelete: "restrict" }),
  probability: integer("probability").default(0),
  expectedCloseDate: timestamp("expectedCloseDate"),
  closedAt: timestamp("closedAt"),
  lostReason: text("lostReason"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const dealHistory = pgTable("dealHistory", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("dealId")
    .notNull()
    .references(() => deals.id, { onDelete: "cascade" }),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fromStageId: uuid("fromStageId").references(() => dealStages.id, { onDelete: "set null" }),
  toStageId: uuid("toStageId").references(() => dealStages.id, { onDelete: "set null" }),
  changeType: varchar("changeType", { length: 50 }).notNull(),
  fieldName: varchar("fieldName", { length: 100 }),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const companyRequests = pgTable("companyRequest", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestedBy: uuid("requestedBy")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("companyId").references(() => companies.id, { onDelete: "cascade" }),
  companyName: text("companyName").notNull(),
  email: text("email"),
  phone: varchar("phone", { length: 50 }),
  website: text("website"),
  industry: varchar("industry", { length: 100 }),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  reviewedBy: uuid("reviewedBy").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const organizationBranding = pgTable("organizationBranding", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organizationId"),
  name: text("name").notNull().default("SalPip"),
  logoUrl: text("logoUrl"),
  primaryColor: varchar("primaryColor", { length: 50 }).notNull().default("217 91% 60%"),
  secondaryColor: varchar("secondaryColor", { length: 50 }).notNull().default("214 32% 91%"),
  accentColor: varchar("accentColor", { length: 50 }).notNull().default("142 71% 45%"),
  sidebarColor: varchar("sidebarColor", { length: 50 }).notNull().default("215 25% 27%"),
  createdBy: uuid("createdBy").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const contactRequests = pgTable("contactRequest", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  phone: varchar("phone", { length: 50 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});
