import { BehaviorMetric, UserPersonalityProfile, ProductPsychology } from "../drizzle/schema";

/**
 * Big Five personality traits
 */
export type PersonalityTrait = "openness" | "conscientiousness" | "extraversion" | "agreeableness" | "neuroticism";

/**
 * Calculate personality scores from behavioral metrics
 * Based on research correlations between behavior and personality
 */
export function calculatePersonalityFromBehavior(metrics: BehaviorMetric): Partial<UserPersonalityProfile> {
  const scores: Partial<UserPersonalityProfile> = {};

  // Click speed analysis
  const avgClickSpeed = Number(metrics.avgClickSpeed) || 0;
  if (avgClickSpeed > 0) {
    // Fast clicking suggests high extraversion and low conscientiousness
    scores.extraversion = Math.min(100, 50 + (avgClickSpeed * 10));
    scores.conscientiousness = Math.max(0, 50 - (avgClickSpeed * 5));
  }

  // Impulsive clicks ratio
  const impulsiveRatio = metrics.totalClicks > 0 
    ? (metrics.impulsiveClicks / metrics.totalClicks) 
    : 0;
  
  if (impulsiveRatio > 0.3) {
    // High impulsivity suggests low conscientiousness, high extraversion
    scores.conscientiousness = Math.max(0, (scores.conscientiousness || 50) - 10);
    scores.extraversion = Math.min(100, (scores.extraversion || 50) + 10);
  }

  // Scroll behavior
  const avgScrollSpeed = Number(metrics.avgScrollSpeed) || 0;
  const maxScrollDepth = metrics.maxScrollDepth || 0;
  
  if (maxScrollDepth > 80) {
    // Deep scrolling suggests high openness (curiosity)
    scores.openness = Math.min(100, 50 + 15);
  }

  // Dwell time analysis
  const avgDwellTime = Number(metrics.avgDwellTime) || 0;
  if (avgDwellTime > 30) {
    // Long dwell time suggests high conscientiousness
    scores.conscientiousness = Math.min(100, (scores.conscientiousness || 50) + 15);
  } else if (avgDwellTime < 10) {
    // Short dwell time suggests high extraversion or low conscientiousness
    scores.extraversion = Math.min(100, (scores.extraversion || 50) + 10);
  }

  // Bounce rate
  const bounceRate = Number(metrics.bounceRate) || 0;
  if (bounceRate > 0.7) {
    // High bounce rate might indicate neuroticism (anxiety, quick exit)
    scores.neuroticism = Math.min(100, 50 + 15);
  }

  // Pages visited
  if (metrics.pagesVisited > 5) {
    // Exploring multiple pages suggests openness
    scores.openness = Math.min(100, (scores.openness || 50) + 10);
  }

  return scores;
}

/**
 * Analyze search terms for personality indicators using simple heuristics
 * In production, this would use LLM (Gemini API)
 */
export function analyzeSearchTerms(searchTerms: string[]): Partial<UserPersonalityProfile> {
  const scores: Partial<UserPersonalityProfile> = {};
  
  if (!searchTerms || searchTerms.length === 0) return scores;

  const allText = searchTerms.join(" ").toLowerCase();

  // Self-referential language (I, me, my) suggests neuroticism
  const selfRefCount = (allText.match(/\b(ben|bana|benim|kendim)\b/g) || []).length;
  if (selfRefCount > 3) {
    scores.neuroticism = Math.min(100, 50 + (selfRefCount * 5));
  }

  // Question words suggest openness (curiosity)
  const questionCount = (allText.match(/\b(nasıl|neden|ne|kim|nerede)\b/g) || []).length;
  if (questionCount > 2) {
    scores.openness = Math.min(100, 50 + (questionCount * 8));
  }

  // Specific, detailed queries suggest conscientiousness
  const avgWordLength = allText.split(" ").reduce((sum, word) => sum + word.length, 0) / searchTerms.length;
  if (avgWordLength > 6) {
    scores.conscientiousness = Math.min(100, 50 + 15);
  }

  return scores;
}

/**
 * Determine dominant personality trait
 */
export function getDominantTrait(profile: UserPersonalityProfile): PersonalityTrait {
  const traits: Array<[PersonalityTrait, number]> = [
    ["openness", profile.openness],
    ["conscientiousness", profile.conscientiousness],
    ["extraversion", profile.extraversion],
    ["agreeableness", profile.agreeableness],
    ["neuroticism", profile.neuroticism],
  ];

  traits.sort((a, b) => b[1] - a[1]);
  return traits[0][0];
}

/**
 * Calculate purchase probability based on personality-product match
 * Formula: P(Buy|User,Product) = f(TraitsUser · AttributesProduct)
 */
export function calculatePurchaseProbability(
  userProfile: UserPersonalityProfile,
  productPsych: ProductPsychology
): number {
  // Dot product of user traits and product attributes
  const score =
    (userProfile.openness * productPsych.appealsToOpenness +
     userProfile.conscientiousness * productPsych.appealsToConscientiousness +
     userProfile.extraversion * productPsych.appealsToExtraversion +
     userProfile.agreeableness * productPsych.appealsToAgreeableness +
     userProfile.neuroticism * productPsych.appealsToNeuroticism) / 50000; // Normalize to 0-1

  // Apply cultural context bonus
  if (userProfile.culturalContext === "asian") {
    const culturalBonus = productPsych.mianziScore / 1000;
    return Math.min(1, score + culturalBonus);
  } else if (userProfile.culturalContext === "african" || userProfile.culturalContext === "middle_eastern") {
    const culturalBonus = productPsych.ubuntuScore / 1000;
    return Math.min(1, score + culturalBonus);
  }

  return Math.min(Math.max(score, 0), 1);
}

/**
 * Sort products by personality match
 */
export function sortProductsByPersonality(
  products: Array<{ id: number; psychology: ProductPsychology | null }>,
  userProfile: UserPersonalityProfile
): number[] {
  const scored = products.map(p => ({
    id: p.id,
    score: p.psychology 
      ? calculatePurchaseProbability(userProfile, p.psychology)
      : 0.5, // Default score for products without psychology data
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.id);
}

/**
 * Get theme configuration based on dominant personality trait
 */
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  layout: "minimalist" | "structured" | "calm" | "energetic" | "warm";
  contentPriority: string[];
}

export function getThemeForPersonality(dominantTrait: PersonalityTrait): ThemeConfig {
  const themes: Record<PersonalityTrait, ThemeConfig> = {
    openness: {
      name: "Kaşif",
      colors: {
        primary: "oklch(0.6 0.15 280)", // Purple
        secondary: "oklch(0.7 0.12 320)",
        accent: "oklch(0.8 0.1 40)",
      },
      layout: "minimalist",
      contentPriority: ["yeni", "sınırlı", "sanatsal", "benzersiz"],
    },
    conscientiousness: {
      name: "Analitik",
      colors: {
        primary: "oklch(0.5 0.12 240)", // Blue
        secondary: "oklch(0.6 0.1 220)",
        accent: "oklch(0.7 0.08 200)",
      },
      layout: "structured",
      contentPriority: ["teknik", "karşılaştırma", "uzman", "detay"],
    },
    neuroticism: {
      name: "Güvenli",
      colors: {
        primary: "oklch(0.7 0.08 160)", // Soft green
        secondary: "oklch(0.75 0.06 180)",
        accent: "oklch(0.8 0.05 140)",
      },
      layout: "calm",
      contentPriority: ["garanti", "destek", "güvenli", "iade"],
    },
    extraversion: {
      name: "Sosyal",
      colors: {
        primary: "oklch(0.65 0.2 30)", // Orange
        secondary: "oklch(0.7 0.18 50)",
        accent: "oklch(0.75 0.15 10)",
      },
      layout: "energetic",
      contentPriority: ["trend", "popüler", "sosyal", "yeni"],
    },
    agreeableness: {
      name: "Topluluk",
      colors: {
        primary: "oklch(0.68 0.12 120)", // Warm green
        secondary: "oklch(0.72 0.1 100)",
        accent: "oklch(0.76 0.08 80)",
      },
      layout: "warm",
      contentPriority: ["yorumlar", "hediye", "sevilen", "önerilen"],
    },
  };

  return themes[dominantTrait];
}

/**
 * Check if user should be protected from manipulative tactics
 * High neuroticism users should not see FOMO tactics
 */
export function shouldProtectFromManipulation(profile: UserPersonalityProfile): boolean {
  return profile.neuroticism > 70;
}

/**
 * Detect cultural context from IP or user data
 * This is a simplified version - in production would use IP geolocation
 */
export function detectCulturalContext(countryCode?: string): UserPersonalityProfile["culturalContext"] {
  if (!countryCode) return "western";

  const asianCountries = ["CN", "JP", "KR", "TW", "HK", "SG", "TH", "VN", "MY"];
  const africanCountries = ["ZA", "NG", "KE", "EG", "GH", "TZ", "UG", "ET"];
  const middleEasternCountries = ["TR", "SA", "AE", "IR", "IQ", "IL", "JO", "LB"];

  if (asianCountries.includes(countryCode)) return "asian";
  if (africanCountries.includes(countryCode)) return "african";
  if (middleEasternCountries.includes(countryCode)) return "middle_eastern";

  return "western";
}
