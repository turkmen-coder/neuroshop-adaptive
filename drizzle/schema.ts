import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User personality profiles based on Big Five model
 * Scores range from 0-100 for each trait
 */
export const userPersonalityProfiles = mysqlTable("user_personality_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Big Five personality scores (0-100)
  openness: int("openness").default(50).notNull(),
  conscientiousness: int("conscientiousness").default(50).notNull(),
  extraversion: int("extraversion").default(50).notNull(),
  agreeableness: int("agreeableness").default(50).notNull(),
  neuroticism: int("neuroticism").default(50).notNull(),
  
  // Dominant trait for quick UI adaptation
  dominantTrait: mysqlEnum("dominantTrait", ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]),
  
  // Cultural context
  culturalContext: mysqlEnum("culturalContext", ["western", "asian", "african", "middle_eastern"]).default("western").notNull(),
  
  // Confidence score (0-100) - how reliable is this profile
  confidenceScore: int("confidenceScore").default(0).notNull(),
  
  // Consent and transparency
  consentGiven: boolean("consentGiven").default(false).notNull(),
  dataTransparency: boolean("dataTransparency").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPersonalityProfile = typeof userPersonalityProfiles.$inferSelect;
export type InsertUserPersonalityProfile = typeof userPersonalityProfiles.$inferInsert;

/**
 * Behavioral metrics collected from user interactions
 */
export const behaviorMetrics = mysqlTable("behavior_metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  
  // Click behavior
  avgClickSpeed: decimal("avgClickSpeed", { precision: 10, scale: 2 }),
  totalClicks: int("totalClicks").default(0).notNull(),
  impulsiveClicks: int("impulsiveClicks").default(0).notNull(),
  
  // Scroll behavior
  avgScrollSpeed: decimal("avgScrollSpeed", { precision: 10, scale: 2 }),
  maxScrollDepth: int("maxScrollDepth").default(0).notNull(),
  
  // Navigation patterns
  avgDwellTime: decimal("avgDwellTime", { precision: 10, scale: 2 }),
  pagesVisited: int("pagesVisited").default(0).notNull(),
  bounceRate: decimal("bounceRate", { precision: 5, scale: 2 }),
  
  // Search queries for text analysis
  searchTerms: json("searchTerms").$type<string[]>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BehaviorMetric = typeof behaviorMetrics.$inferSelect;
export type InsertBehaviorMetric = typeof behaviorMetrics.$inferInsert;

/**
 * Product catalog
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("imageUrl"),
  category: varchar("category", { length: 100 }),
  stock: int("stock").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Psychological attributes for each product
 * Scores indicate how much each product appeals to each personality trait (0-100)
 */
export const productPsychology = mysqlTable("product_psychology", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().unique(),
  
  // Big Five appeal scores (0-100)
  appealsToOpenness: int("appealsToOpenness").default(50).notNull(),
  appealsToConscientiousness: int("appealsToConscientiousness").default(50).notNull(),
  appealsToExtraversion: int("appealsToExtraversion").default(50).notNull(),
  appealsToAgreeableness: int("appealsToAgreeableness").default(50).notNull(),
  appealsToNeuroticism: int("appealsToNeuroticism").default(50).notNull(),
  
  // Cultural resonance scores (0-100)
  mianziScore: int("mianziScore").default(50).notNull(), // Social prestige (Asian)
  ubuntuScore: int("ubuntuScore").default(50).notNull(), // Community value (African)
  
  // Product positioning tags
  tags: json("tags").$type<string[]>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductPsychology = typeof productPsychology.$inferSelect;
export type InsertProductPsychology = typeof productPsychology.$inferInsert;

/**
 * Shopping cart
 */
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "cancelled"]).default("pending").notNull(),
  shippingAddress: text("shippingAddress"),
  items: json("items").$type<Array<{ productId: number; quantity: number; price: number }>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
