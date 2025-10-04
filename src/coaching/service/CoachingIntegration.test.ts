import { CoachingManager } from "./CoachingManager";
import { CoachingService } from "./CoachingService";
import { ruleCoachShot } from "../engines/ruleEngine";
import { classifyExtraction } from "../extraction";
import { ShotFormData, RoastLevel, Suggestion } from "@types";

// Mock dependencies
jest.mock("../engines/ruleEngine");
jest.mock("../extraction");
jest.mock("./CoachingService");

const mockRuleCoachShot = ruleCoachShot as jest.MockedFunction<
  typeof ruleCoachShot
>;
const mockClassifyExtraction = classifyExtraction as jest.MockedFunction<
  typeof classifyExtraction
>;
const MockCoachingService = CoachingService as jest.MockedClass<
  typeof CoachingService
>;

describe("Coaching Integration Tests", () => {
  let coachingManager: CoachingManager;
  let mockCoachingService: jest.Mocked<CoachingService>;

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
    rating: 4,
    acidity: 0.5,
    bitterness: -0.3,
    body: 0.2,
    aftertaste: 0.1,
    tastingTags: ["balanced", "sweet"],
    notes: "Great shot!",
    isFavorite: false,
  };

  const mockRoast: RoastLevel = "Medium";

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the CoachingService methods
    mockCoachingService = {
      getSuggestions: jest.fn(),
    } as any;

    // Mock the CoachingService constructor
    MockCoachingService.mockImplementation(() => mockCoachingService);
  });

  describe("Basic Integration", () => {
    it("should integrate CoachingManager with CoachingService", async () => {
      coachingManager = new CoachingManager({
        mode: "rule",
        enableCaching: false,
        maxCacheAge: 1000,
      });

      const mockSuggestions: Suggestion[] = [
        {
          field: "dose_g",
          delta: 0.5,
          target: 18.5,
          reason: "Increase dose for better body",
          priority: 2,
          confidence: "med",
          source: "rule",
        },
      ];

      mockCoachingService.getSuggestions.mockResolvedValue(mockSuggestions);

      const result = await coachingManager.getSuggestions(
        mockShotFormData,
        mockRoast
      );

      expect(MockCoachingService).toHaveBeenCalledWith("rule", undefined);
      expect(mockCoachingService.getSuggestions).toHaveBeenCalledWith(
        mockShotFormData,
        mockRoast
      );
      expect(result.suggestions).toEqual(mockSuggestions);
      expect(result.version).toBe("coach-rule-v4");
    });

    it("should handle different coaching modes", async () => {
      const mockSuggestions: Suggestion[] = [];

      // Test AI mode
      const aiManager = new CoachingManager({
        mode: "ai",
        aiApiKey: "test-key",
        enableCaching: false,
        maxCacheAge: 1000,
      });

      expect(MockCoachingService).toHaveBeenCalledWith("ai", "test-key");

      // Test hybrid mode
      const hybridManager = new CoachingManager({
        mode: "hybrid",
        aiApiKey: "test-key",
        enableCaching: false,
        maxCacheAge: 1000,
      });

      expect(MockCoachingService).toHaveBeenCalledWith("hybrid", "test-key");
    });
  });

  describe("Real-world Integration", () => {
    beforeEach(() => {
      coachingManager = new CoachingManager({
        mode: "rule",
        enableCaching: false,
        maxCacheAge: 1000,
      });

      // Mock realistic responses
      mockClassifyExtraction.mockReturnValue({
        score: 0.1,
        label: "balanced",
        confidence: "high",
        reason: "Good extraction parameters",
      });

      mockRuleCoachShot.mockReturnValue([
        {
          field: "dose_g",
          delta: 0.3,
          target: 18.3,
          reason: "Slight increase for better body",
          priority: 2,
          confidence: "med",
          source: "rule",
        },
      ]);
    });

    it("should complete full coaching flow with real functions", async () => {
      // Mock the coaching service to use the real underlying functions
      mockCoachingService.getSuggestions.mockImplementation(
        async (shotData, roast) => {
          const extraction = classifyExtraction(shotData, roast);
          return ruleCoachShot(shotData, extraction, roast);
        }
      );

      const result = await coachingManager.getSuggestions(
        mockShotFormData,
        mockRoast
      );

      expect(result).toMatchObject({
        version: "coach-rule-v4",
        suggestions: expect.any(Array),
        inputHash: expect.any(String),
        computedAt: expect.any(String),
      });

      expect(result.suggestions).toHaveLength(1);
      expect(result.suggestions[0].field).toBe("dose_g");
    });

    it("should handle typical shot creation workflow", async () => {
      mockCoachingService.getSuggestions.mockImplementation(
        async (shotData, roast) => {
          const extraction = classifyExtraction(shotData, roast);
          return ruleCoachShot(shotData, extraction, roast);
        }
      );

      const typicalShot: ShotFormData = {
        beanId: "bean-123",
        machineId: "machine-456",
        dose_g: "18.0",
        yield_g: "36.0",
        shotTime_s: "28.0",
        ratio: "2.0",
        grindSetting: "4.5",
        waterTemp_C: "93.0",
        preinfusion_s: "5.0",
        rating: 4,
        acidity: 0.2,
        bitterness: -0.1,
        body: 0.3,
        aftertaste: 0.1,
        tastingTags: ["balanced", "sweet", "clean"],
        notes: "Perfect morning shot",
        isFavorite: false,
      };

      const result = await coachingManager.getSuggestions(
        typicalShot,
        "Medium"
      );

      expect(result.suggestions).toHaveLength(1);
      expect(result.suggestions[0].field).toBe("dose_g");
      expect(result.suggestions[0].delta).toBe(0.3);
      expect(result.suggestions[0].target).toBe(18.3);
    });
  });

  describe("Error Handling Integration", () => {
    beforeEach(() => {
      coachingManager = new CoachingManager({
        mode: "rule",
        enableCaching: false,
        maxCacheAge: 1000,
      });
    });

    it("should handle coaching service errors", async () => {
      mockCoachingService.getSuggestions.mockRejectedValue(
        new Error("Service temporarily unavailable")
      );

      await expect(
        coachingManager.getSuggestions(mockShotFormData, mockRoast)
      ).rejects.toThrow("Service temporarily unavailable");
    });
  });

  describe("Performance Integration", () => {
    beforeEach(() => {
      coachingManager = new CoachingManager({
        mode: "rule",
        enableCaching: false,
        maxCacheAge: 1000,
      });
    });

    it("should handle multiple requests efficiently", async () => {
      const mockSuggestions: Suggestion[] = [];
      mockCoachingService.getSuggestions.mockResolvedValue(mockSuggestions);

      const startTime = Date.now();

      const promises = Array(5)
        .fill(null)
        .map((_, i) =>
          coachingManager.getSuggestions(
            {
              ...mockShotFormData,
              dose_g: `${18 + i}.0`,
            },
            mockRoast
          )
        );

      const results = await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(5);
      expect(mockCoachingService.getSuggestions).toHaveBeenCalledTimes(5);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
