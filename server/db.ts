import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  userPersonalityProfiles,
  InsertUserPersonalityProfile,
  behaviorMetrics,
  InsertBehaviorMetric,
  products,
  InsertProduct,
  productPsychology,
  InsertProductPsychology,
  cartItems,
  InsertCartItem,
  orders,
  InsertOrder,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER MANAGEMENT =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= PERSONALITY PROFILE =============

export async function getOrCreatePersonalityProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(userPersonalityProfiles)
    .where(eq(userPersonalityProfiles.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create default profile
  const newProfile: InsertUserPersonalityProfile = {
    userId,
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
    confidenceScore: 0,
    consentGiven: false,
  };

  await db.insert(userPersonalityProfiles).values(newProfile);
  
  const created = await db
    .select()
    .from(userPersonalityProfiles)
    .where(eq(userPersonalityProfiles.userId, userId))
    .limit(1);

  return created[0] || null;
}

export async function updatePersonalityProfile(userId: number, updates: Partial<InsertUserPersonalityProfile>) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(userPersonalityProfiles)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(userPersonalityProfiles.userId, userId));

  return getOrCreatePersonalityProfile(userId);
}

// ============= BEHAVIOR METRICS =============

export async function saveBehaviorMetrics(metrics: InsertBehaviorMetric) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(behaviorMetrics).values(metrics);
  return metrics;
}

export async function getBehaviorMetricsBySession(sessionId: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(behaviorMetrics)
    .where(eq(behaviorMetrics.sessionId, sessionId))
    .orderBy(desc(behaviorMetrics.createdAt));
}

// ============= PRODUCTS =============

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] || null;
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(products).values(product);
  return result;
}

export async function updateProduct(id: number, updates: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(products)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(products.id, id));

  return getProductById(id);
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  return true;
}

// ============= PRODUCT PSYCHOLOGY =============

export async function getProductPsychology(productId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(productPsychology)
    .where(eq(productPsychology.productId, productId))
    .limit(1);

  return result[0] || null;
}

export async function upsertProductPsychology(data: InsertProductPsychology) {
  const db = await getDb();
  if (!db) return null;

  await db
    .insert(productPsychology)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        appealsToOpenness: data.appealsToOpenness,
        appealsToConscientiousness: data.appealsToConscientiousness,
        appealsToExtraversion: data.appealsToExtraversion,
        appealsToAgreeableness: data.appealsToAgreeableness,
        appealsToNeuroticism: data.appealsToNeuroticism,
        mianziScore: data.mianziScore,
        ubuntuScore: data.ubuntuScore,
        tags: data.tags,
        updatedAt: new Date(),
      },
    });

  return getProductPsychology(data.productId);
}

// ============= CART =============

export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(cartItems)
    .where(eq(cartItems.userId, userId))
    .orderBy(desc(cartItems.createdAt));
}

export async function addToCart(data: InsertCartItem) {
  const db = await getDb();
  if (!db) return null;

  // Check if item already exists
  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, data.userId), eq(cartItems.productId, data.productId)))
    .limit(1);

  if (existing.length > 0) {
    // Update quantity
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + (data.quantity || 1), updatedAt: new Date() })
      .where(eq(cartItems.id, existing[0].id));
    return existing[0];
  }

  await db.insert(cartItems).values(data);
  return data;
}

export async function updateCartItem(id: number, quantity: number) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(cartItems)
    .set({ quantity, updatedAt: new Date() })
    .where(eq(cartItems.id, id));

  return true;
}

export async function removeFromCart(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(cartItems).where(eq(cartItems.id, id));
  return true;
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(cartItems).where(eq(cartItems.userId, userId));
  return true;
}

// ============= ORDERS =============

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(orders).values(order);
  return result;
}

export async function getOrdersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0] || null;
}
