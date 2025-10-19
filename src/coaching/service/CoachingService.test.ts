import { CoachingService } from "./CoachingService";
import { ruleCoachShot } from "../engines/ruleEngine";
import { classifyExtraction } from "../extraction";
import { AIEngine } from "./AIEngine";
import {
  ShotFormData,
  RoastLevel,
  ExtractionSummary,
  Suggestion,
} from "@types";

// Mock dependencies
jest.mock("../engines/ruleEngine");
jest.mock("../extraction");
jest.mock("./AIEngine");

const mockRuleCoachShot = ruleCoachShot as jest.MockedFunction<
  typeof ruleCoachShot
>;
const mockClassifyExtraction = classifyExtraction as jest.MockedFunction<
  typeof classifyExtraction
>;
const MockAIEngine = AIEngine as jest.MockedClass<typeof AIEngine>;

describe("CoachingService", () => {
  let coachingService: CoachingService;

  const mockShotFormData: ShotFormData = {
    beanId: "bean-1",
    machineId: "machine-1",
    dose_g: "18.0",
    yield_g: "36.0",
    shotTime_s: "30.0",
    ratio: "2.0",
    grindSetting: "5.0",
    waterTemp_C: "93.0",
    preinfusion_s: "5.0",
    overallScore: 8,
    acidity: 0.5,
    bitterness: -0.3,
    body: 0.2,
    aftertaste: 0.1,
    tastingTags: ["balanced", "sweet"],
    notes: "Great shot!",
    isFavorite: false,
  };

  const mockRoast: RoastLevel = "Medium";

  const mockExtraction: ExtractionSummary = {
    score: 0.2,
    label: "balanced",
    confidence: "med",
    reason: "Well-balanced extraction",
  };

  const mockSuggestions: Suggestion[] = [
    {
      field: "dose_g",
      delta: 0.5,
      target: 18.5,
      reason: "Slightly increase dose for better body",
      priority: 2,
      confidence: "med",
      source: "rule",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockClassifyExtraction.mockReturnValue(mockExtraction);
    mockRuleCoachShot.mockReturnValue(mockSuggestions);
  });

  describe("Rule Mode", () => {
    beforeEach(() => {
      coachingService = new CoachingService("rule");
    });

    it("should return rule-based suggestions", async () => {
      const result = await coachingService.getSuggestions(
        mockShotFormData,
        mockRoast
      );

      expect(mockRuleCoachShot).toHaveBeenCalledWith(
        mockShotFormData,
        mockExtraction,
        mockRoast
      );
      expect(result).toEqual(mockSuggestions);
    });

    it("should calculate extraction if not provided", async () => {
      await coachingService.getSuggestions(mockShotFormData, mockRoast);

      expect(mockClassifyExtraction).toHaveBeenCalledWith(
        mockShotFormData,
        mockRoast
      );
      expect(mockRuleCoachShot).toHaveBeenCalledWith(
        mockShotFormData,
        mockExtraction,
        mockRoast
      );
    });

    it("should use provided extraction without recalculating", async () => {
      const customExtraction: ExtractionSummary = {
        score: 0.5,
        label: "over",
        confidence: "high",
        reason: "Over-extracted",
      };

      await coachingService.getSuggestions(
        mockShotFormData,
        mockRoast,
        customExtraction
      );

      expect(mockClassifyExtraction).not.toHaveBeenCalled();
      expect(mockRuleCoachShot).toHaveBeenCalledWith(
        mockShotFormData,
        customExtraction,
        mockRoast
      );
    });

    it("should handle different roast levels", async () => {
      const roastLevels: RoastLevel[] = [
        "Light",
        "Medium Light",
        "Medium",
        "Medium Dark",
        "Dark",
      ];

      for (const roast of roastLevels) {
        await coachingService.getSuggestions(mockShotFormData, roast);
        expect(mockRuleCoachShot).toHaveBeenCalledWith(
          mockShotFormData,
          mockExtraction,
          roast
        );
      }
    });
  });

  describe("AI Mode", () => {
    let mockAIEngine: jest.Mocked<AIEngine>;

    beforeEach(() => {
      mockAIEngine = {
        generateSuggestions: jest.fn().mockResolvedValue(mockSuggestions),
      } as any;
      MockAIEngine.mockImplementation(() => mockAIEngine);

      coachingService = new CoachingService("ai", "test-api-key");
    });

    it("should return AI suggestions when AI engine is available", async () => {
      const result = await coachingService.getSuggestions(
        mockShotFormData,
        mockRoast
      );

      expect(mockAIEngine.generateSuggestions).toHaveBeenCalledWith(
        mockShotFormData,
        mockExtraction,
        mockRoast
      );
      expect(result).toEqual(mockSuggestions);
    });

    it("should fallback to rule engine when AI engine fails", async () => {
      mockAIEngine.generateSuggestions.mockRejectedValue(
        new Error("AI API failed")
      );

      const result = await coachingService.getSuggestions(
        mockShotFormData,
        mockRoast
      );

      expect(mockRuleCoachShot).toHaveBeenCalledWith(
        mockShotFormData,
        mockExtraction,
        mockRoast
      );
      expect(result).toEqual(mockSuggestions);
    });

    it("should initialize AI engine with API key", () => {
      expect(MockAIEngine).toHaveBeenCalledWith("test-api-key");
    });

    it("should calculate extraction for AI mode", async () => {
      await coachingService.getSuggestions(mockShotFormData, mockRoast);

      expect(mockClassifyExtraction).toHaveBeenCalledWith(
        mockShotFormData,
        mockRoast
      );
      expect(mockAIEngine.generateSuggestions).toHaveBeenCalledWith(
        mockShotFormData,
        mockExtraction,
        mockRoast
      );
    });
  });

  describe("Hybrid Mode", () => {
    let mockAIEngine: jest.Mocked<AIEngine>;

    beforeEach(() => {
      mockAIEngine = {
        generateSuggestions: jest.fn().mockResolvedValue([
          {
            field: "waterTemp_C",
            delta: -2,
            target: 91,
            reason: "Lower temperature for better acidity",
            priority: 1,
            confidence: "high",
            source: "ai",
          },
        ]),
      } as any;
      MockAIEngine.mockImplementation(() => mockAIEngine);

      coachingService = new CoachingService("hybrid", "test-api-key");
    });

    it("should combine rule and AI suggestions", async () => {
      const result = await coachingService.getSuggestions(
        mockShotFormData,
        mockRoast
      );

      expect(mockRuleCoachShot).toHaveBeenCalled();
      expect(mockAIEngine.generateSuggestions).toHaveBeenCalled();
      expect(result).toHaveLength(2); // Rule suggestion + AI suggestion
      expect(result[0].source).toBe("rule");
      expect(result[1].source).toBe("ai");
    });

    it("should handle conflicting suggestions correctly", async () => {
      // Create conflicting suggestions (same field, opposite directions)
      const conflictingAISuggestion: Suggestion = {
        field: "dose_g",
        delta: -0.5, // Opposite direction from rule suggestion
        target: 17.5,
        reason: "Decrease dose for better extraction",
        priority: 1,
        confidence: "high",
        source: "ai",
      };

      mockAIEngine.generateSuggestions.mockResolvedValue([
        conflictingAISuggestion,
      ]);

      const result = await coachingService.getSuggestions(
        mockShotFormData,
        mockRoast
      );

      // Should only include rule suggestion (conflicting AI suggestion should be filtered out)
      expect(result).toHaveLength(1);
      expect(result[0].source).toBe("rule");
    });

    it("should fallback to rule-only when AI fails", async () => {
      mockAIEngine.generateSuggestions.mockRejectedValue(
        new Error("AI failed")
      );

      const result = await coachingService.getSuggestions(
        mockShotFormData,
        mockRoast
      );

      expect(mockRuleCoachShot).toHaveBeenCalled();
      expect(result).toEqual(mockSuggestions);
    });

    it("should sort suggestions by priority", async () => {
      const lowPriorityAISuggestion: Suggestion = {
        field: "preinfusion_s",
        delta: 1,
        target: 6,
        reason: "Slight increase in preinfusion",
        priority: 3, // Lower priority than rule suggestion
        confidence: "low",
        source: "ai",
      };

      mockAIEngine.generateSuggestions.mockResolvedValue([
        lowPriorityAISuggestion,
      ]);

      const result = await coachingService.getSuggestions(
        mockShotFormData,
        mockRoast
      );

      expect(result).toHaveLength(2);
      expect(result[0].priority).toBeGreaterThanOrEqual(result[1].priority);
    });

    it("should limit to 3 suggestions maximum", async () => {
      const manyAISuggestions: Suggestion[] = [
        {
          field: "waterTemp_C",
          delta: -2,
          target: 91,
          reason: "Lower temperature",
          priority: 1,
          confidence: "high",
          source: "ai",
        },
        {
          field: "preinfusion_s",
          delta: 1,
          target: 6,
          reason: "Increase preinfusion",
          priority: 2,
          confidence: "med",
          source: "ai",
        },
        {
          field: "ratio",
          delta: 0.1,
          target: 2.1,
          reason: "Slight ratio adjustment",
          priority: 3,
          confidence: "low",
          source: "ai",
        },
      ];

      mockAIEngine.generateSuggestions.mockResolvedValue(manyAISuggestions);

      const result = await coachingService.getSuggestions(
        mockShotFormData,
        mockRoast
      );

      expect(result).toHaveLength(3); // Should be limited to 3
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      coachingService = new CoachingService("rule");
    });

    it("should handle rule engine errors gracefully", async () => {
      mockRuleCoachShot.mockImplementation(() => {
        throw new Error("Rule engine failed");
      });

      await expect(
        coachingService.getSuggestions(mockShotFormData, mockRoast)
      ).rejects.toThrow("Rule engine failed");
    });

    it("should handle extraction calculation errors", async () => {
      mockClassifyExtraction.mockImplementation(() => {
        throw new Error("Extraction calculation failed");
      });

      await expect(
        coachingService.getSuggestions(mockShotFormData, mockRoast)
      ).rejects.toThrow("Extraction calculation failed");
    });
  });

  describe("Edge Cases", () => {
    beforeEach(() => {
      coachingService = new CoachingService("rule");
    });

    it("should handle empty suggestions", async () => {
      mockRuleCoachShot.mockReturnValue([]);

      const result = await coachingService.getSuggestions(
        mockShotFormData,
        mockRoast
      );

      expect(result).toEqual([]);
    });

    it("should handle undefined extraction gracefully", async () => {
      mockClassifyExtraction.mockReturnValue({
        score: 0,
        label: "balanced",
        confidence: "low",
        reason: "No extraction data",
      });

      const result = await coachingService.getSuggestions(
        mockShotFormData,
        mockRoast
      );

      expect(result).toEqual(mockSuggestions);
    });

    it("should handle extreme shot parameters", async () => {
      const extremeShotData: ShotFormData = {
        ...mockShotFormData,
        dose_g: "50.0", // Very high dose
        yield_g: "10.0", // Very low yield
        shotTime_s: "60.0", // Very long time
        ratio: "0.2", // Very low ratio
        waterTemp_C: "100.0", // Very high temp
      };

      const result = await coachingService.getSuggestions(
        extremeShotData,
        mockRoast
      );

      expect(mockRuleCoachShot).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("Constructor Validation", () => {
    it("should initialize with default rule mode", () => {
      const service = new CoachingService();
      expect(service).toBeInstanceOf(CoachingService);
    });

    it("should initialize AI engine for AI mode", () => {
      new CoachingService("ai", "api-key");
      expect(MockAIEngine).toHaveBeenCalledWith("api-key");
    });

    it("should initialize AI engine for hybrid mode", () => {
      new CoachingService("hybrid", "api-key");
      expect(MockAIEngine).toHaveBeenCalledWith("api-key");
    });

    it("should handle empty API key gracefully", () => {
      expect(() => new CoachingService("ai", "")).not.toThrow();
      expect(MockAIEngine).toHaveBeenCalledWith("");
    });
  });
});
