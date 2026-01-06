import { describe, expect, it } from "vitest";
import {
  analyzeTextForPersonality,
  mergePersonalityInsights,
  type PersonalityInsights,
} from "./gemini-analysis";

describe("Gemini Analysis", () => {
  describe("mergePersonalityInsights", () => {
    it("should merge new insights with existing profile", () => {
      const existing = {
        openness: 50,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
        confidenceScore: 60,
      };

      const newInsights: PersonalityInsights = {
        openness: 80,
        conscientiousness: 40,
        extraversion: 70,
        agreeableness: 60,
        neuroticism: 30,
        confidence: 80,
        reasoning: "Test analysis",
      };

      const merged = mergePersonalityInsights(existing, newInsights, 0.3);

      // New insights should influence the scores
      expect(merged.openness).toBeGreaterThan(50);
      expect(merged.extraversion).toBeGreaterThan(50);
      expect(merged.neuroticism).toBeLessThan(50);
      
      // Confidence should increase
      expect(merged.confidenceScore).toBeGreaterThan(60);
    });

    it("should weight insights based on confidence", () => {
      const existing = {
        openness: 50,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
        confidenceScore: 60,
      };

      const lowConfidenceInsights: PersonalityInsights = {
        openness: 100,
        conscientiousness: 100,
        extraversion: 100,
        agreeableness: 100,
        neuroticism: 100,
        confidence: 20, // Low confidence
        reasoning: "Low confidence test",
      };

      const merged = mergePersonalityInsights(existing, lowConfidenceInsights, 0.5);

      // With low confidence, changes should be minimal
      expect(Math.abs(merged.openness - 50)).toBeLessThan(20);
    });

    it("should not exceed score bounds", () => {
      const existing = {
        openness: 90,
        conscientiousness: 10,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
        confidenceScore: 60,
      };

      const extremeInsights: PersonalityInsights = {
        openness: 100,
        conscientiousness: 0,
        extraversion: 100,
        agreeableness: 100,
        neuroticism: 0,
        confidence: 100,
        reasoning: "Extreme test",
      };

      const merged = mergePersonalityInsights(existing, extremeInsights, 0.8);

      // All scores should stay within 0-100
      expect(merged.openness).toBeGreaterThanOrEqual(0);
      expect(merged.openness).toBeLessThanOrEqual(100);
      expect(merged.conscientiousness).toBeGreaterThanOrEqual(0);
      expect(merged.conscientiousness).toBeLessThanOrEqual(100);
    });
  });

  describe("analyzeTextForPersonality", () => {
    it("should return valid personality scores for short text", async () => {
      const text = "akıllı telefon";
      const insights = await analyzeTextForPersonality(text);

      // Should return all required fields
      expect(insights).toHaveProperty("openness");
      expect(insights).toHaveProperty("conscientiousness");
      expect(insights).toHaveProperty("extraversion");
      expect(insights).toHaveProperty("agreeableness");
      expect(insights).toHaveProperty("neuroticism");
      expect(insights).toHaveProperty("confidence");
      expect(insights).toHaveProperty("reasoning");

      // All scores should be within valid range
      expect(insights.openness).toBeGreaterThanOrEqual(0);
      expect(insights.openness).toBeLessThanOrEqual(100);
      expect(insights.confidence).toBeGreaterThanOrEqual(0);
      expect(insights.confidence).toBeLessThanOrEqual(100);
    }, 15000); // 15 second timeout for API call
  });
});
