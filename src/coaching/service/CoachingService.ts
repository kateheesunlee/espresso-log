import {
  ShotFormData,
  ExtractionSummary,
  RoastLevel,
  Suggestion,
} from "@types";
import { ruleCoachShot } from "../engines/ruleEngine";
import { classifyExtraction } from "../extraction";
import { AIEngine } from "./AIEngine";

type EngineMode = "rule" | "ai" | "hybrid";

export class CoachingService {
  private aiEngine?: AIEngine;

  constructor(private mode: EngineMode = "rule", aiApiKey?: string) {
    if (mode === "ai" || mode === "hybrid") {
      this.aiEngine = new AIEngine(aiApiKey || "");
    }
  }

  async getSuggestions(
    shotFormData: ShotFormData,
    roast: RoastLevel,
    extraction?: ExtractionSummary
  ): Promise<Suggestion[]> {
    const extractionSummary =
      extraction || classifyExtraction(shotFormData, roast);

    switch (this.mode) {
      case "rule":
        return ruleCoachShot(shotFormData, extractionSummary, roast);

      case "ai":
        if (!this.aiEngine) {
          console.warn("AI engine not initialized, falling back to rules");
          return ruleCoachShot(shotFormData, extractionSummary, roast);
        }
        try {
          return await this.aiEngine.generateSuggestions(
            shotFormData,
            extractionSummary,
            roast
          );
        } catch (error) {
          console.warn("AI engine failed, falling back to rules:", error);
          return ruleCoachShot(shotFormData, extractionSummary, roast);
        }

      case "hybrid":
        // Always get rule-based suggestions first (fast)
        const ruleSuggestions = ruleCoachShot(
          shotFormData,
          extractionSummary,
          roast
        );

        // If AI is available, enhance with AI suggestions
        if (this.aiEngine) {
          try {
            const aiSuggestions = await this.aiEngine.generateSuggestions(
              shotFormData,
              extractionSummary,
              roast
            );
            // Combine and deduplicate suggestions
            return this.combineSuggestions(ruleSuggestions, aiSuggestions);
          } catch (error) {
            console.warn(
              "AI suggestions failed, using rule-based only:",
              error
            );
          }
        }

        return ruleSuggestions;

      default:
        return [];
    }
  }

  private combineSuggestions(
    ruleSuggestions: Suggestion[],
    aiSuggestions: Suggestion[]
  ): Suggestion[] {
    // Combine suggestions, prioritizing rule-based for critical issues
    // and AI for nuanced recommendations
    const combined = [...ruleSuggestions];

    // Add AI suggestions that don't conflict with rule suggestions
    for (const aiSuggestion of aiSuggestions) {
      const hasConflict = ruleSuggestions.some(
        (rule) =>
          rule.field === aiSuggestion.field &&
          Math.sign(rule.delta || 0) !== Math.sign(aiSuggestion.delta || 0)
      );

      if (!hasConflict) {
        combined.push(aiSuggestion);
      }
    }

    // Sort by priority and limit to top 3
    return combined.sort((a, b) => b.priority - a.priority).slice(0, 3);
  }
}
