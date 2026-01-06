import type { UserPersonalityProfile } from "../drizzle/schema";
import type { Product } from "../drizzle/schema";
import { calculatePurchaseProbability } from "./personality";

export interface ProductWithScore {
  product: Product;
  score: number;
  reason: string;
}

/**
 * Get personalized product recommendations based on user's personality profile
 */
export async function getPersonalizedRecommendations(
  userProfile: UserPersonalityProfile,
  allProducts: Array<Product & { psychology: any }>,
  limit: number = 10
): Promise<ProductWithScore[]> {
  // Calculate scores for all products
  const scoredProducts = allProducts.map((product) => {
    const score = product.psychology ? calculatePurchaseProbability(userProfile, product.psychology) : 50;
    const reason = generateRecommendationReason(product.psychology, userProfile);
    
    return {
      product: product as Product,
      score,
      reason,
    };
  });

  // Sort by score descending and take top N
  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Generate human-readable explanation for why a product is recommended
 */
function generateRecommendationReason(
  psychology: any,
  userProfile: UserPersonalityProfile
): string {
  if (!psychology) return "Size uygun olabilir";

  const traits = [
    { name: "Openness", userScore: userProfile.openness, productScore: psychology.appealsToOpenness, label: "yenilikçi" },
    { name: "Conscientiousness", userScore: userProfile.conscientiousness, productScore: psychology.appealsToConscientiousness, label: "düzenli" },
    { name: "Extraversion", userScore: userProfile.extraversion, productScore: psychology.appealsToExtraversion, label: "sosyal" },
    { name: "Agreeableness", userScore: userProfile.agreeableness, productScore: psychology.appealsToAgreeableness, label: "uyumlu" },
    { name: "Neuroticism", userScore: userProfile.neuroticism, productScore: psychology.appealsToNeuroticism, label: "duygusal" },
  ];

  // Find the trait with highest match
  const bestMatch = traits.reduce((best, trait) => {
    const match = Math.abs(trait.userScore - trait.productScore);
    const bestMatchScore = Math.abs(best.userScore - best.productScore);
    return match < bestMatchScore ? trait : best;
  });

  if (bestMatch.userScore > 60 && bestMatch.productScore > 60) {
    return `${bestMatch.label} kişiliğinize uygun`;
  } else if (bestMatch.userScore < 40 && bestMatch.productScore < 40) {
    return `Tercihlerinize göre seçildi`;
  }

  return "Size özel önerildi";
}

/**
 * Get trending products (most added to cart recently)
 */
export interface TrendingProduct {
  product: Product;
  addCount: number;
}

export async function getTrendingProducts(
  allProducts: Product[],
  limit: number = 10
): Promise<TrendingProduct[]> {
  // For now, return random products as trending
  // In production, this would query cart_items table for most added products
  const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, limit).map(product => ({
    product,
    addCount: Math.floor(Math.random() * 50) + 10,
  }));
}
