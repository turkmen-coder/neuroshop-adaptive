import { getDb } from "./db";
import { sql } from "drizzle-orm";

export interface ThemePerformance {
  themeVariant: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  avgValue: number;
}

export interface PersonalityThemePerformance {
  personalityTrait: string;
  themeVariant: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
}

/**
 * Get overall theme performance metrics
 */
export async function getThemePerformanceMetrics(days: number = 30): Promise<ThemePerformance[]> {
  const db = await getDb();
  if (!db) return [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.setDate(cutoffDate.getDate() - days));

  const query = sql`
    SELECT 
      ti.theme_variant,
      COUNT(DISTINCT ti.id) as impressions,
      COUNT(DISTINCT ce.id) as conversions,
      ROUND(COUNT(DISTINCT ce.id) * 100.0 / NULLIF(COUNT(DISTINCT ti.id), 0), 2) as conversion_rate,
      ROUND(AVG(ce.value), 2) as avg_value
    FROM theme_impressions ti
    LEFT JOIN conversion_events ce 
      ON ti.session_id = ce.session_id 
      AND ti.theme_variant = ce.theme_variant
      AND ce.event_type = 'purchase'
    WHERE ti.created_at >= ${cutoffDate}
    GROUP BY ti.theme_variant
    ORDER BY conversion_rate DESC
  `;

  const result: any = await db.execute(query);
  const rows = Array.isArray(result) ? result : result.rows || [];
  
  return rows.map((row: any) => ({
    themeVariant: row.theme_variant,
    impressions: Number(row.impressions),
    conversions: Number(row.conversions),
    conversionRate: Number(row.conversion_rate) || 0,
    avgValue: Number(row.avg_value) || 0,
  }));
}

/**
 * Get performance breakdown by personality trait and theme
 */
export async function getPersonalityThemeBreakdown(days: number = 30): Promise<PersonalityThemePerformance[]> {
  const db = await getDb();
  if (!db) return [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const query = sql`
    SELECT 
      ti.personality_trait,
      ti.theme_variant,
      COUNT(DISTINCT ti.id) as impressions,
      COUNT(DISTINCT ce.id) as conversions,
      ROUND(COUNT(DISTINCT ce.id) * 100.0 / NULLIF(COUNT(DISTINCT ti.id), 0), 2) as conversion_rate
    FROM theme_impressions ti
    LEFT JOIN conversion_events ce 
      ON ti.session_id = ce.session_id 
      AND ti.theme_variant = ce.theme_variant
      AND ce.event_type IN ('add_to_cart', 'purchase')
    WHERE ti.created_at >= ${cutoffDate}
      AND ti.personality_trait IS NOT NULL
    GROUP BY ti.personality_trait, ti.theme_variant
    ORDER BY ti.personality_trait, conversion_rate DESC
  `;

  const result: any = await db.execute(query);
  const rows = Array.isArray(result) ? result : result.rows || [];
  
  return rows.map((row: any) => ({
    personalityTrait: row.personality_trait,
    themeVariant: row.theme_variant,
    impressions: Number(row.impressions),
    conversions: Number(row.conversions),
    conversionRate: Number(row.conversion_rate) || 0,
  }));
}

/**
 * Track theme impression
 */
export async function trackThemeImpression(data: {
  userId?: number;
  sessionId: string;
  themeVariant: string;
  personalityTrait?: string;
  pageUrl: string;
}) {
  const db = await getDb();
  if (!db) return;

  await db.execute(sql`
    INSERT INTO theme_impressions (user_id, session_id, theme_variant, personality_trait, page_url)
    VALUES (${data.userId || null}, ${data.sessionId}, ${data.themeVariant}, ${data.personalityTrait || null}, ${data.pageUrl})
  `);
}

/**
 * Track conversion event
 */
export async function trackConversionEvent(data: {
  userId?: number;
  sessionId: string;
  themeVariant: string;
  personalityTrait?: string;
  eventType: 'add_to_cart' | 'purchase' | 'view_product';
  productId?: number;
  value?: number;
}) {
  const db = await getDb();
  if (!db) return;

  await db.execute(sql`
    INSERT INTO conversion_events (user_id, session_id, theme_variant, personality_trait, event_type, product_id, value)
    VALUES (${data.userId || null}, ${data.sessionId}, ${data.themeVariant}, ${data.personalityTrait || null}, ${data.eventType}, ${data.productId || null}, ${data.value || null})
  `);
}
