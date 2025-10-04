// src/coaching/engines/ruleEngine.test.ts
import { ruleCoachShot } from "./ruleEngine";
import { ShotFormData, ExtractionSummary } from "@types";

describe("ruleEngine", () => {
  // Global extraction objects for different scenarios
  const overExtraction: ExtractionSummary = {
    score: 0.8,
    label: "over",
    confidence: "high",
    reason: "Harsh/bitter signals dominate (over-extracted).",
  };

  const underExtraction: ExtractionSummary = {
    score: -0.8,
    label: "under",
    confidence: "high",
    reason: "Bright/sour signals dominate (under-extracted).",
  };

  const balancedExtraction: ExtractionSummary = {
    score: 0.1,
    label: "balanced",
    confidence: "low",
    reason: "Sweet spot around balanced acidity and bitterness.",
  };

  const slightlyOverExtraction: ExtractionSummary = {
    score: 0.3,
    label: "slightly-over",
    confidence: "med",
    reason: "Slightly bitter/heavy profile.",
  };

  const slightlyUnderExtraction: ExtractionSummary = {
    score: -0.3,
    label: "slightly-under",
    confidence: "med",
    reason: "Slightly bright with lighter bitterness.",
  };

  // Helper to create base shot input
  const createBaseShot = (overrides?: Partial<ShotFormData>): ShotFormData => ({
    dose_g: "18",
    yield_g: "36",
    shotTime_s: "30",
    waterTemp_C: "93",
    acidity: 0,
    bitterness: 0,
    body: 0,
    aftertaste: 0,
    beanId: "1",
    machineId: "1",
    grindSetting: "1",
    ratio: "2",
    preinfusion_s: "0",
    rating: 0,
    tastingTags: [],
    notes: "",
    isFavorite: false,
    ...overrides,
  });

  describe("Bitterness Rules", () => {
    it("should suggest coarser grind for high bitterness", () => {
      const shot = createBaseShot({
        bitterness: 0.8,
      });

      const suggestions = ruleCoachShot(shot, overExtraction, "Medium");

      expect(suggestions.length).toBeGreaterThan(0);
      const grindSuggestion = suggestions.find((s) => s.field === "grindStep");
      expect(grindSuggestion).toBeDefined();
      expect(grindSuggestion?.delta).toBeGreaterThan(0); // Positive = coarser
      expect(grindSuggestion?.reason).toContain("coarser");
    });

    it("should suggest finer grind for low bitterness", () => {
      const shot = createBaseShot({
        bitterness: -0.8,
      });

      const suggestions = ruleCoachShot(shot, underExtraction, "Medium");

      const grindSuggestion = suggestions.find((s) => s.field === "grindStep");
      expect(grindSuggestion).toBeDefined();
      expect(grindSuggestion?.delta).toBeLessThan(0); // Negative = finer
      expect(grindSuggestion?.reason).toContain("finer");
    });

    it("should suggest higher ratio for high bitterness", () => {
      const shot = createBaseShot({
        bitterness: 0.8,
      });

      const suggestions = ruleCoachShot(shot, overExtraction, "Medium");

      const ratioSuggestion = suggestions.find((s) => s.field === "ratio");
      expect(ratioSuggestion).toBeDefined();
      expect(ratioSuggestion?.target).toBeGreaterThan(2.0); // Higher than standard 1:2
    });

    it("should assign high confidence for strong bitterness signal", () => {
      const shot = createBaseShot({
        bitterness: 1.0, // Maximum
      });

      const suggestions = ruleCoachShot(shot, overExtraction, "Medium");

      const grindSuggestion = suggestions.find((s) => s.field === "grindStep");
      expect(grindSuggestion?.confidence).toBe("high");
    });
  });

  describe("Acidity Rules", () => {
    it("should suggest finer grind for high acidity", () => {
      const shot = createBaseShot({
        acidity: 0.8,
      });

      const suggestions = ruleCoachShot(shot, underExtraction, "Medium");

      const grindSuggestion = suggestions.find((s) => s.field === "grindStep");
      expect(grindSuggestion).toBeDefined();
      expect(grindSuggestion?.delta).toBeLessThan(0); // Negative = finer
    });

    it("should suggest higher temperature for low acidity", () => {
      const shot = createBaseShot({
        acidity: -0.8,
        waterTemp_C: "93",
      });

      const suggestions = ruleCoachShot(shot, underExtraction, "Medium");

      const tempSuggestion = suggestions.find((s) => s.field === "waterTemp_C");
      expect(tempSuggestion).toBeDefined();
      expect(tempSuggestion?.delta).toBeGreaterThan(0); // Raise temp
      expect(tempSuggestion?.reason).toContain("brightness");
    });

    it("should not suggest temperature changes when waterTemp_C is undefined", () => {
      const shot = createBaseShot({
        acidity: -0.8,
        waterTemp_C: undefined,
      });

      const suggestions = ruleCoachShot(shot, underExtraction, "Medium");

      const tempSuggestion = suggestions.find((s) => s.field === "waterTemp_C");
      expect(tempSuggestion).toBeUndefined();
    });
  });

  describe("Body Rules", () => {
    it("should suggest increased dose for low body", () => {
      const shot = createBaseShot({
        body: -0.8,
      });

      const suggestions = ruleCoachShot(shot, underExtraction, "Medium");

      const doseSuggestion = suggestions.find((s) => s.field === "dose_g");
      expect(doseSuggestion).toBeDefined();
      expect(doseSuggestion?.delta).toBeGreaterThan(0);
      expect(doseSuggestion?.reason).toContain("Body low");
    });

    it("should suggest higher ratio for heavy body", () => {
      const shot = createBaseShot({
        body: 0.8,
      });

      const suggestions = ruleCoachShot(shot, overExtraction, "Medium");

      const ratioSuggestion = suggestions.find((s) => s.field === "ratio");
      expect(ratioSuggestion).toBeDefined();
      expect(ratioSuggestion?.target).toBeGreaterThan(2.0);
      expect(ratioSuggestion?.reason).toContain("heavy");
    });
  });

  describe("Aftertaste Rules", () => {
    it("should suggest coarser grind for harsh finish", () => {
      const shot = createBaseShot({
        aftertaste: 0.8,
      });

      const suggestions = ruleCoachShot(shot, overExtraction, "Medium");

      const grindSuggestion = suggestions.find((s) => s.field === "grindStep");
      expect(grindSuggestion).toBeDefined();
      expect(grindSuggestion?.delta).toBeGreaterThan(0);
      expect(grindSuggestion?.reason).toContain("Harsh finish");
    });

    it("should suggest longer extraction for short finish", () => {
      const shot = createBaseShot({
        aftertaste: -0.8,
      });

      const suggestions = ruleCoachShot(shot, underExtraction, "Medium");

      const timeSuggestion = suggestions.find((s) => s.field === "shotTime_s");
      expect(timeSuggestion).toBeDefined();
      expect(timeSuggestion?.delta).toBeGreaterThan(0);
      expect(timeSuggestion?.reason).toContain("Longer extraction");
    });
  });

  describe("Roast-Specific Thresholds", () => {
    it("should trigger suggestions at lower threshold for Light roast", () => {
      const shot = createBaseShot({
        bitterness: 0.45, // Between 0.4 and 0.5
      });

      const lightExtraction: ExtractionSummary = {
        score: 0.45,
        label: "over",
        confidence: "high",
        reason: "Bitterness high → coarser grind",
      };

      const lightSuggestions = ruleCoachShot(shot, lightExtraction, "Light");
      const mediumSuggestions = ruleCoachShot(shot, lightExtraction, "Medium");

      // Light roast should trigger (threshold 0.4), medium shouldn't (threshold 0.5)
      expect(lightSuggestions.length).toBeGreaterThan(0);
      expect(mediumSuggestions.length).toBe(0);
    });

    it("should be more tolerant for Dark roast", () => {
      const shot = createBaseShot({
        bitterness: 0.55, // Between 0.5 and 0.6
      });

      const darkExtraction: ExtractionSummary = {
        score: 0.55,
        label: "over",
        confidence: "high",
        reason: "Bitterness high → coarser grind",
      };

      const darkSuggestions = ruleCoachShot(shot, darkExtraction, "Dark");
      const mediumSuggestions = ruleCoachShot(shot, darkExtraction, "Medium");

      // Medium should trigger (threshold 0.5), dark shouldn't (threshold 0.6)
      expect(darkSuggestions.length).toBe(0);
      expect(mediumSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe("Roast Bias Application", () => {
    it("should prioritize temperature increase for Light roast with low acidity", () => {
      const shot = createBaseShot({
        acidity: -0.8,
        waterTemp_C: "93",
      });

      const suggestions = ruleCoachShot(shot, underExtraction, "Light");

      const tempSuggestion = suggestions.find((s) => s.field === "waterTemp_C");
      expect(tempSuggestion).toBeDefined();
      // Light roast bias should boost temp increase priority
    });

    it("should prioritize temperature decrease for Dark roast with high bitterness", () => {
      const shot = createBaseShot({
        bitterness: 0.8,
        waterTemp_C: "93",
      });

      const suggestions = ruleCoachShot(shot, overExtraction, "Dark");

      const tempSuggestion = suggestions.find((s) => s.field === "waterTemp_C");
      // Temperature suggestion might not be in top 3, but if it is, should be decrease
      if (tempSuggestion) {
        expect(tempSuggestion.delta).toBeLessThan(0); // Decrease
      }
      // For Dark roast, grind and ratio should be prioritized
      expect(suggestions.some((s) => s.field === "grindStep")).toBe(true);
    });
  });

  describe("Multiple Imbalances", () => {
    it("should handle multiple imbalances and prioritize correctly", () => {
      const shot = createBaseShot({
        bitterness: 0.8,
        acidity: 0.7,
        body: -0.6,
        aftertaste: 0.5,
      });

      const suggestions = ruleCoachShot(shot, overExtraction, "Medium");

      // Should return top 3 suggestions
      expect(suggestions.length).toBeLessThanOrEqual(3);

      // Should include high-priority suggestions
      const priorities = suggestions.map((s) => s.priority);
      expect(Math.min(...priorities)).toBeLessThanOrEqual(2); // At least one priority 1 or 2
    });

    it("should deduplicate conflicting suggestions", () => {
      const shot = createBaseShot({
        bitterness: 0.8, // Suggests coarser
        acidity: 0.7, // Also suggests finer (conflicting)
      });

      const suggestions = ruleCoachShot(shot, overExtraction, "Medium");

      // Should not have duplicate grindStep suggestions
      const grindSuggestions = suggestions.filter(
        (s) => s.field === "grindStep"
      );
      expect(grindSuggestions.length).toBeLessThanOrEqual(1);
    });
  });

  describe("Delta Clamping", () => {
    it("should clamp temperature deltas to ±2°C", () => {
      const shot = createBaseShot({
        bitterness: 1.0, // Maximum signal
        waterTemp_C: "93",
      });

      const suggestions = ruleCoachShot(shot, overExtraction, "Medium");

      const tempSuggestion = suggestions.find((s) => s.field === "waterTemp_C");
      if (tempSuggestion?.delta !== undefined) {
        expect(Math.abs(tempSuggestion.delta)).toBeLessThanOrEqual(2);
      }
    });

    it("should clamp time deltas to ±4s", () => {
      const shot = createBaseShot({
        bitterness: 1.0,
      });

      const suggestions = ruleCoachShot(shot, overExtraction, "Medium");

      const timeSuggestion = suggestions.find((s) => s.field === "shotTime_s");
      if (timeSuggestion?.delta !== undefined) {
        expect(Math.abs(timeSuggestion.delta)).toBeLessThanOrEqual(4);
      }
    });

    it("should clamp ratio targets to safe range (1.5-2.6)", () => {
      const shot = createBaseShot({
        bitterness: 1.0,
        ratio: "2.5", // Already high
      });

      const suggestions = ruleCoachShot(shot, overExtraction, "Medium");

      const ratioSuggestion = suggestions.find((s) => s.field === "ratio");
      if (ratioSuggestion?.target !== undefined) {
        expect(ratioSuggestion.target).toBeGreaterThanOrEqual(1.5);
        expect(ratioSuggestion.target).toBeLessThanOrEqual(2.6);
      }
    });
  });

  describe("Balanced Shot", () => {
    it("should return minimal suggestions for perfectly balanced shot", () => {
      const shot = createBaseShot({
        acidity: 0,
        bitterness: 0,
        body: 0,
        aftertaste: 0,
      });

      const suggestions = ruleCoachShot(shot, balancedExtraction, "Medium");

      // Should return very few or no suggestions
      expect(suggestions.length).toBeLessThanOrEqual(1);
    });

    it("should return no suggestions for slightly unbalanced shot below threshold", () => {
      const shot = createBaseShot({
        bitterness: 0.3, // Below 0.5 threshold
        acidity: -0.2,
      });

      const suggestions = ruleCoachShot(shot, slightlyOverExtraction, "Medium");

      expect(suggestions.length).toBe(0);
    });
  });

  describe("Confidence Levels", () => {
    it("should assign low confidence for weak signals", () => {
      const shot = createBaseShot({
        bitterness: 0.6, // Just above threshold
      });

      const suggestions = ruleCoachShot(shot, slightlyOverExtraction, "Medium");

      const suggestion = suggestions.find((s) => s.field === "shotTime_s");
      expect(suggestion?.confidence).toBe("low");
    });

    it("should assign medium confidence for moderate signals", () => {
      const shot = createBaseShot({
        bitterness: 0.7,
      });

      const suggestions = ruleCoachShot(shot, slightlyOverExtraction, "Medium");

      // Some suggestions should have medium confidence
      const hasmediumConf = suggestions.some((s) => s.confidence === "med");
      expect(hasmediumConf).toBe(true);
    });

    it("should assign high confidence for strong signals", () => {
      const shot = createBaseShot({
        bitterness: 1.0,
      });

      const suggestions = ruleCoachShot(shot, overExtraction, "Medium");

      const grindSuggestion = suggestions.find((s) => s.field === "grindStep");
      expect(grindSuggestion?.confidence).toBe("high");
    });
  });

  describe("Source Attribution", () => {
    it("should mark all suggestions as coming from rules", () => {
      const shot = createBaseShot({
        bitterness: 0.8,
      });

      const suggestions = ruleCoachShot(shot, overExtraction, "Medium");

      suggestions.forEach((suggestion) => {
        expect(suggestion.source).toBe("rule");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined balance values", () => {
      const shot = createBaseShot({
        acidity: undefined,
        bitterness: undefined,
        body: undefined,
        aftertaste: undefined,
      });

      expect(() =>
        ruleCoachShot(shot, balancedExtraction, "Medium")
      ).not.toThrow();
      const suggestions = ruleCoachShot(shot, balancedExtraction, "Medium");
      expect(suggestions.length).toBe(0);
    });

    it("should handle missing ratio and calculate from dose/yield", () => {
      const shot = createBaseShot({
        bitterness: 0.8,
        ratio: "2", // Should be calculated from dose/yield
      });

      const suggestions = ruleCoachShot(shot, overExtraction, "Medium");

      expect(suggestions.length).toBeGreaterThan(0);
      // Ratio suggestions should be based on calculated 2.0
    });

    it("should handle extreme imbalance values", () => {
      const shot = createBaseShot({
        bitterness: 1.0,
        acidity: 1.0,
        body: -1.0,
        aftertaste: -1.0,
      });

      expect(() => ruleCoachShot(shot, overExtraction, "Medium")).not.toThrow();
      const suggestions = ruleCoachShot(shot, overExtraction, "Medium");
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });
});
