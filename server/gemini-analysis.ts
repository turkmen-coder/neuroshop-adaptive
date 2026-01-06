import { invokeLLM } from "./_core/llm";

/**
 * Analyze search queries and text input using Gemini API
 * to extract personality insights
 */

export interface PersonalityInsights {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  confidence: number;
  reasoning: string;
}

/**
 * Analyze a single search query or text input using Gemini
 */
export async function analyzeTextForPersonality(text: string): Promise<PersonalityInsights> {
  const prompt = `Sen bir psikoloji uzmanısın. Kullanıcının yazdığı metni analiz ederek Big Five kişilik özelliklerini çıkar.

Metin: "${text}"

Bu metinden yola çıkarak kullanıcının kişilik özelliklerini 0-100 arası skorla. Her özellik için kısa açıklama yap.

Big Five Özellikleri:
1. Openness (Deneyime Açıklık): Yenilik, merak, sanat, farklı deneyimlere ilgi
2. Conscientiousness (Sorumluluk): Düzen, planlama, detaylara dikkat, hedef odaklılık
3. Extraversion (Dışadönüklük): Sosyal etkileşim, enerji, konuşkanlık
4. Agreeableness (Uyumluluk): İşbirliği, empati, yardımseverlik
5. Neuroticism (Nevrotiklik): Endişe, stres, duygusal dalgalanma

Yanıtını JSON formatında ver. Confidence skoru metnin uzunluğu ve içeriğine göre güvenilirlik seviyesini göstersin (0-100).`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Sen bir psikoloji uzmanısın ve metin analizinden kişilik çıkarımı yapıyorsun. Her zaman JSON formatında yanıt veriyorsun." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "personality_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              openness: {
                type: "number",
                description: "Deneyime açıklık skoru (0-100)",
              },
              conscientiousness: {
                type: "number",
                description: "Sorumluluk skoru (0-100)",
              },
              extraversion: {
                type: "number",
                description: "Dışadönüklük skoru (0-100)",
              },
              agreeableness: {
                type: "number",
                description: "Uyumluluk skoru (0-100)",
              },
              neuroticism: {
                type: "number",
                description: "Nevrotiklik skoru (0-100)",
              },
              confidence: {
                type: "number",
                description: "Analiz güvenilirlik skoru (0-100)",
              },
              reasoning: {
                type: "string",
                description: "Kısa açıklama (maksimum 200 karakter)",
              },
            },
            required: ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism", "confidence", "reasoning"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from Gemini API");
    }

    const insights: PersonalityInsights = JSON.parse(content);

    // Validate scores are within range
    const validateScore = (score: number) => Math.max(0, Math.min(100, score));
    insights.openness = validateScore(insights.openness);
    insights.conscientiousness = validateScore(insights.conscientiousness);
    insights.extraversion = validateScore(insights.extraversion);
    insights.agreeableness = validateScore(insights.agreeableness);
    insights.neuroticism = validateScore(insights.neuroticism);
    insights.confidence = validateScore(insights.confidence);

    return insights;
  } catch (error) {
    console.error("[Gemini Analysis] Error:", error);
    
    // Fallback to basic heuristics if API fails
    return fallbackAnalysis(text);
  }
}

/**
 * Fallback analysis using simple heuristics if Gemini API fails
 */
function fallbackAnalysis(text: string): PersonalityInsights {
  const lowerText = text.toLowerCase();
  const wordCount = text.split(/\s+/).length;

  // Simple heuristics
  const hasQuestions = /\?|nasıl|neden|ne|kim|nerede/.test(lowerText);
  const hasEmotional = /seviyorum|nefret|korku|endişe|mutlu|üzgün/.test(lowerText);
  const hasSpecific = wordCount > 5;
  const hasSocial = /arkadaş|sosyal|parti|birlikte|grup/.test(lowerText);
  const hasDetail = /detay|özellik|karşılaştır|analiz/.test(lowerText);

  return {
    openness: hasQuestions ? 65 : 50,
    conscientiousness: hasDetail || hasSpecific ? 65 : 50,
    extraversion: hasSocial ? 65 : 50,
    agreeableness: 50,
    neuroticism: hasEmotional ? 60 : 45,
    confidence: 30, // Low confidence for fallback
    reasoning: "Basit metin analizi (API kullanılamadı)",
  };
}

/**
 * Analyze multiple search queries and combine insights
 */
export async function analyzeSearchQueries(queries: string[]): Promise<PersonalityInsights> {
  if (queries.length === 0) {
    return {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
      confidence: 0,
      reasoning: "Analiz için yeterli veri yok",
    };
  }

  // Combine all queries into one text for analysis
  const combinedText = queries.join(". ");

  // If text is too short, use fallback
  if (combinedText.length < 10) {
    return fallbackAnalysis(combinedText);
  }

  return analyzeTextForPersonality(combinedText);
}

/**
 * Merge new insights with existing personality profile
 * Uses weighted average based on confidence scores
 */
export function mergePersonalityInsights(
  existing: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    confidenceScore: number;
  },
  newInsights: PersonalityInsights,
  weight: number = 0.3 // How much to weight the new insights (0-1)
): {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  confidenceScore: number;
} {
  // Adjust weight based on new insights confidence
  const adjustedWeight = weight * (newInsights.confidence / 100);
  const existingWeight = 1 - adjustedWeight;

  return {
    openness: Math.round(existing.openness * existingWeight + newInsights.openness * adjustedWeight),
    conscientiousness: Math.round(existing.conscientiousness * existingWeight + newInsights.conscientiousness * adjustedWeight),
    extraversion: Math.round(existing.extraversion * existingWeight + newInsights.extraversion * adjustedWeight),
    agreeableness: Math.round(existing.agreeableness * existingWeight + newInsights.agreeableness * adjustedWeight),
    neuroticism: Math.round(existing.neuroticism * existingWeight + newInsights.neuroticism * adjustedWeight),
    confidenceScore: Math.min(100, Math.round(existing.confidenceScore + newInsights.confidence * 0.1)),
  };
}
