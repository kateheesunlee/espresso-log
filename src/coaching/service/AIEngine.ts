// AI Coaching Engine - Future implementation
import {
  ShotFormData,
  ExtractionSummary,
  RoastLevel,
  Suggestion,
} from "@types";

export class AIEngine {
  constructor(private apiKey: string) {}

  async generateSuggestions(
    shotFormData: ShotFormData,
    extraction: ExtractionSummary,
    roast: RoastLevel
  ): Promise<Suggestion[]> {
    // TODO: Implement AI API call
    // This would call an external AI service (OpenAI, Claude, etc.)
    // with shot parameters and get personalized suggestions

    const prompt = this.buildPrompt(shotFormData, extraction, roast);

    try {
      // const response = await fetch('/api/ai-coaching', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${this.apiKey}` },
      //   body: JSON.stringify({ prompt, shotData: shotFormData })
      // });

      // const aiSuggestions = await response.json();
      // return this.parseAISuggestions(aiSuggestions);

      // Placeholder for now
      return [];
    } catch (error) {
      console.error("AI coaching failed:", error);
      return []; // Fallback to empty suggestions
    }
  }

  private buildPrompt(
    shotFormData: ShotFormData,
    extraction: ExtractionSummary,
    roast: RoastLevel
  ): string {
    return `
      Analyze this espresso shot and provide 1-3 specific suggestions:
      
      Parameters:
      - Dose: ${shotFormData.dose_g}g
      - Yield: ${shotFormData.yield_g}g
      - Time: ${shotFormData.shotTime_s}s
      - Ratio: ${shotFormData.ratio}
      - Temperature: ${shotFormData.waterTemp_C}°C
      - Roast Level: ${roast}
      
      Taste Profile:
      - Acidity: ${shotFormData.acidity}
      - Bitterness: ${shotFormData.bitterness}
      - Body: ${shotFormData.body}
      - Aftertaste: ${shotFormData.aftertaste}
      
      Extraction Analysis: ${extraction.label} (${extraction.score})
      
      Provide specific, actionable suggestions to improve this shot.
    `;
  }

  private parseAISuggestions(aiResponse: any): Suggestion[] {
    // TODO: Parse AI response into Suggestion format
    return [];
  }
}
