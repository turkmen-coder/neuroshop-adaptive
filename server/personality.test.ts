import { describe, expect, it } from "vitest";
import {
  calculatePersonalityFromBehavior,
  getDominantTrait,
  calculatePurchaseProbability,
  sortProductsByPersonality,
  shouldProtectFromManipulation,
} from "./personality";
import type { BehaviorMetric, UserPersonalityProfile, ProductPsychology } from "../drizzle/schema";

describe("Personality Analysis", () => {
  describe("calculatePersonalityFromBehavior", () => {
    it("should identify high extraversion from fast clicking", () => {
      const metrics: BehaviorMetric = {
        id: 1,
        userId: 1,
        sessionId: "test-session",
        avgClickSpeed: "2.5" as any, // 2.5 clicks per second
        totalClicks: 50,
        impulsiveClicks: 20,
        avgScrollSpeed: "100" as any,
        maxScrollDepth: 50,
        avgDwellTime: "15" as any,
        pagesVisited: 3,
        bounceRate: "0.3" as any,
        searchTerms: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const scores = calculatePersonalityFromBehavior(metrics);

      expect(scores.extraversion).toBeGreaterThan(50);
    });

    it("should identify high conscientiousness from long dwell time", () => {
      const metrics: BehaviorMetric = {
        id: 1,
        userId: 1,
        sessionId: "test-session",
        avgClickSpeed: "0.5" as any,
        totalClicks: 10,
        impulsiveClicks: 1,
        avgScrollSpeed: "50" as any,
        maxScrollDepth: 90,
        avgDwellTime: "45" as any, // 45 seconds
        pagesVisited: 2,
        bounceRate: "0.1" as any,
        searchTerms: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const scores = calculatePersonalityFromBehavior(metrics);

      expect(scores.conscientiousness).toBeGreaterThan(50);
    });

    it("should identify high openness from deep scrolling", () => {
      const metrics: BehaviorMetric = {
        id: 1,
        userId: 1,
        sessionId: "test-session",
        avgClickSpeed: "1" as any,
        totalClicks: 20,
        impulsiveClicks: 5,
        avgScrollSpeed: "100" as any,
        maxScrollDepth: 95, // Deep scroll
        avgDwellTime: "20" as any,
        pagesVisited: 8, // Many pages
        bounceRate: "0.2" as any,
        searchTerms: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const scores = calculatePersonalityFromBehavior(metrics);

      expect(scores.openness).toBeGreaterThan(50);
    });

    it("should identify neuroticism from high bounce rate", () => {
      const metrics: BehaviorMetric = {
        id: 1,
        userId: 1,
        sessionId: "test-session",
        avgClickSpeed: "1" as any,
        totalClicks: 5,
        impulsiveClicks: 2,
        avgScrollSpeed: "200" as any,
        maxScrollDepth: 30,
        avgDwellTime: "5" as any,
        pagesVisited: 1,
        bounceRate: "0.8" as any, // High bounce
        searchTerms: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const scores = calculatePersonalityFromBehavior(metrics);

      expect(scores.neuroticism).toBeGreaterThan(50);
    });
  });

  describe("getDominantTrait", () => {
    it("should return the trait with highest score", () => {
      const profile: UserPersonalityProfile = {
        id: 1,
        userId: 1,
        openness: 85,
        conscientiousness: 50,
        extraversion: 60,
        agreeableness: 45,
        neuroticism: 30,
        dominantTrait: null,
        culturalContext: "western",
        confidenceScore: 70,
        consentGiven: true,
        dataTransparency: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const dominant = getDominantTrait(profile);

      expect(dominant).toBe("openness");
    });
  });

  describe("calculatePurchaseProbability", () => {
    it("should return high probability for matching personality-product pair", () => {
      const userProfile: UserPersonalityProfile = {
        id: 1,
        userId: 1,
        openness: 90,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 30,
        dominantTrait: "openness",
        culturalContext: "western",
        confidenceScore: 80,
        consentGiven: true,
        dataTransparency: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const productPsych: ProductPsychology = {
        id: 1,
        productId: 1,
        appealsToOpenness: 95, // High match
        appealsToConscientiousness: 40,
        appealsToExtraversion: 50,
        appealsToAgreeableness: 50,
        appealsToNeuroticism: 30,
        mianziScore: 50,
        ubuntuScore: 50,
        tags: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const probability = calculatePurchaseProbability(userProfile, productPsych);

      expect(probability).toBeGreaterThan(0.3); // Adjusted for normalized formula
    });

    it("should return low probability for mismatched personality-product pair", () => {
      const userProfile: UserPersonalityProfile = {
        id: 1,
        userId: 1,
        openness: 20,
        conscientiousness: 90,
        extraversion: 30,
        agreeableness: 50,
        neuroticism: 40,
        dominantTrait: "conscientiousness",
        culturalContext: "western",
        confidenceScore: 80,
        consentGiven: true,
        dataTransparency: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const productPsych: ProductPsychology = {
        id: 1,
        productId: 1,
        appealsToOpenness: 95, // Mismatch
        appealsToConscientiousness: 20, // Mismatch
        appealsToExtraversion: 90, // Mismatch
        appealsToAgreeableness: 50,
        appealsToNeuroticism: 30,
        mianziScore: 50,
        ubuntuScore: 50,
        tags: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const probability = calculatePurchaseProbability(userProfile, productPsych);

      expect(probability).toBeLessThan(0.5);
    });
  });

  describe("sortProductsByPersonality", () => {
    it("should sort products by personality match", () => {
      const userProfile: UserPersonalityProfile = {
        id: 1,
        userId: 1,
        openness: 90,
        conscientiousness: 30,
        extraversion: 40,
        agreeableness: 50,
        neuroticism: 30,
        dominantTrait: "openness",
        culturalContext: "western",
        confidenceScore: 80,
        consentGiven: true,
        dataTransparency: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const products = [
        {
          id: 1,
          psychology: {
            id: 1,
            productId: 1,
            appealsToOpenness: 30,
            appealsToConscientiousness: 80,
            appealsToExtraversion: 50,
            appealsToAgreeableness: 50,
            appealsToNeuroticism: 30,
            mianziScore: 50,
            ubuntuScore: 50,
            tags: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          id: 2,
          psychology: {
            id: 2,
            productId: 2,
            appealsToOpenness: 95,
            appealsToConscientiousness: 40,
            appealsToExtraversion: 50,
            appealsToAgreeableness: 50,
            appealsToNeuroticism: 30,
            mianziScore: 50,
            ubuntuScore: 50,
            tags: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      const sorted = sortProductsByPersonality(products, userProfile);

      // Product 2 (high openness) should be first
      expect(sorted[0]).toBe(2);
      expect(sorted[1]).toBe(1);
    });
  });

  describe("shouldProtectFromManipulation", () => {
    it("should protect users with high neuroticism", () => {
      const profile: UserPersonalityProfile = {
        id: 1,
        userId: 1,
        openness: 50,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 85, // High neuroticism
        dominantTrait: "neuroticism",
        culturalContext: "western",
        confidenceScore: 80,
        consentGiven: true,
        dataTransparency: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const shouldProtect = shouldProtectFromManipulation(profile);

      expect(shouldProtect).toBe(true);
    });

    it("should not protect users with low neuroticism", () => {
      const profile: UserPersonalityProfile = {
        id: 1,
        userId: 1,
        openness: 50,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 40, // Low neuroticism
        dominantTrait: "extraversion",
        culturalContext: "western",
        confidenceScore: 80,
        consentGiven: true,
        dataTransparency: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const shouldProtect = shouldProtectFromManipulation(profile);

      expect(shouldProtect).toBe(false);
    });
  });
});
