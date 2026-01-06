import { drizzle } from "drizzle-orm/mysql2";
import { products } from "../drizzle/schema.js";
import { sql } from "drizzle-orm";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

const result = await db.select({ count: sql`COUNT(*)` }).from(products);
console.log(`Total products in database: ${result[0].count}`);

process.exit(0);
