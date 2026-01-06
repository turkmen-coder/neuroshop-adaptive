import { eq, and, desc, sql } from "drizzle-orm";
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

// ============= PERSONALITY PROFILES =============

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
  const result = await db.insert(userPersonalityProfiles).values({
    userId,
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
    confidenceScore: 30,
    consentGiven: false,
  });

  const newProfile = await db
    .select()
    .from(userPersonalityProfiles)
    .where(eq(userPersonalityProfiles.userId, userId))
    .limit(1);

  return newProfile[0] || null;
}

export async function updatePersonalityProfile(
  userId: number,
  updates: Partial<InsertUserPersonalityProfile>
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(userPersonalityProfiles)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(userPersonalityProfiles.userId, userId));

  return getOrCreatePersonalityProfile(userId);
}

// ============= BEHAVIOR METRICS =============

export async function recordBehaviorMetric(metric: InsertBehaviorMetric) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(behaviorMetrics).values(metric);
  return result;
}

export async function getUserBehaviorMetrics(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(behaviorMetrics)
    .where(eq(behaviorMetrics.userId, userId))
    .orderBy(desc(behaviorMetrics.createdAt))
    .limit(limit);
}

// ============= PRODUCTS =============

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(products).where(eq(products.isActive, true));
}

export async function getProductsPaginated(page: number = 1, limit: number = 20, category?: string) {
  const db = await getDb();
  if (!db) return { products: [], total: 0, page, limit, totalPages: 0 };

  const offset = (page - 1) * limit;
  
  // Build where conditions
  const conditions = [eq(products.isActive, true)];
  if (category) {
    conditions.push(eq(products.category, category));
  }
  
  // Get total count
  const allProducts = await db.select().from(products).where(and(...conditions));
  const total = allProducts.length;
  
  // Get paginated results
  const paginatedProducts = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset);
  
  return {
    products: paginatedProducts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductCategories() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({ category: products.category })
    .from(products)
    .where(and(eq(products.isActive, true), sql`${products.category} IS NOT NULL`))
    .groupBy(products.category);

  return result.map(r => r.category).filter(Boolean) as string[];
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

  const items = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.userId, userId));

  // Join with products
  const itemsWithProducts = await Promise.all(
    items.map(async (item) => ({
      ...item,
      product: await getProductById(item.productId),
    }))
  );

  return itemsWithProducts;
}

export async function addToCart(userId: number, productId: number, quantity: number = 1) {
  const db = await getDb();
  if (!db) return null;

  // Check if item already exists
  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing.length > 0) {
    // Update quantity
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    // Insert new item
    await db.insert(cartItems).values({
      userId,
      productId,
      quantity,
    });
  }

  return getCartItems(userId);
}

export async function updateCartItem(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(cartItems)
    .set({ quantity, updatedAt: new Date() })
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));

  return getCartItems(userId);
}

export async function removeFromCart(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .delete(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));

  return true;
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(cartItems).where(eq(cartItems.userId, userId));
  return true;
}
