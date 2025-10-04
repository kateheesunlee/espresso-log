import { CoachingManager } from "./CoachingManager";
import { CoachingService } from "./CoachingService";
import { COACHING_MODE_CONFIG, generateInputHash } from "../versions";
import { ShotFormData, RoastLevel, Suggestion, CoachingSnapshot } from "@types";

// Mock dependencies
jest.mock("./CoachingService");
jest.mock("../versions", () => ({
  ...jest.requireActual("../versions"),
  generateInputHash: jest.fn(),
}));

const MockCoachingService = CoachingService as jest.MockedClass<
  typeof CoachingService
>;
const mockGenerateInputHash = generateInputHash as jest.MockedFunction<
  typeof generateInputHash
>;

describe("CoachingManager", () => {
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

    mockCoachingService = {
      getSuggestions: jest.fn().mockResolvedValue(mockSuggestions),
    } as any;

    MockCoachingService.mockImplementation(() => mockCoachingService);
    mockGenerateInputHash.mockReturnValue("test-hash-123");
  });

  describe("Constructor and Configuration", () => {
    it("should initialize with rule mode by default", () => {
      coachingManager = new CoachingManager({
        mode: "rule",
        enableCaching: false,
        maxCacheAge: 1000,
      });

      expect(MockCoachingService).toHaveBeenCalledWith("rule", undefined);
      expect(coachingManager.getVersion()).toBe(
        COACHING_MODE_CONFIG.rule.version
      );
    });

    it("should initialize with AI mode and API key", () => {
      coachingManager = new CoachingManager({
        mode: "ai",
        aiApiKey: "test-api-key",
        enableCaching: false,
        maxCacheAge: 1000,
      });

      expect(MockCoachingService).toHaveBeenCalledWith("ai", "test-api-key");
      expect(coachingManager.getVersion()).toBe(
        COACHING_MODE_CONFIG.ai.version
      );
    });

    it("should initialize with hybrid mode", () => {
      coachingManager = new CoachingManager({
        mode: "hybrid",
        aiApiKey: "test-api-key",
        enableCaching: false,
        maxCacheAge: 1000,
      });

      expect(MockCoachingService).toHaveBeenCalledWith(
        "hybrid",
        "test-api-key"
      );
      expect(coachingManager.getVersion()).toBe(
        COACHING_MODE_CONFIG.hybrid.version
      );
    });
  });

  describe("getSuggestions", () => {
    beforeEach(() => {
      coachingManager = new CoachingManager({
        mode: "rule",
        enableCaching: false,
        maxCacheAge: 1000,
      });
    });

    it("should generate suggestions without caching", async () => {
      const result = await coachingManager.getSuggestions(
        mockShotFormData,
        mockRoast
      );

      expect(mockCoachingService.getSuggestions).toHaveBeenCalledWith(
        mockShotFormData,
        mockRoast
      );
      expect(result).toEqual({
        version: COACHING_MODE_CONFIG.rule.version,
        suggestions: mockSuggestions,
        inputHash: "rule-test-hash-123",
        computedAt: expect.any(String),
      });
    });

    it("should generate suggestions with force refresh", async () => {
      const result = await coachingManager.getSuggestions(
        mockShotFormData,
        mockRoast,
        {
          forceRefresh: true,
        }
      );

      expect(mockCoachingService.getSuggestions).toHaveBeenCalledWith(
        mockShotFormData,
        mockRoast
      );
      expect(result).toBeDefined();
    });

    it("should use current timestamp for computedAt", async () => {
      const beforeTime = Date.now();
      const result = await coachingManager.getSuggestions(
        mockShotFormData,
        mockRoast
      );
      const afterTime = Date.now();

      const computedTime = new Date(result.computedAt).getTime();
      expect(computedTime).toBeGreaterThanOrEqual(beforeTime);
      expect(computedTime).toBeLessThanOrEqual(afterTime);
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
        await coachingManager.getSuggestions(mockShotFormData, roast);
        expect(mockCoachingService.getSuggestions).toHaveBeenCalledWith(
          mockShotFormData,
          roast
        );
      }
    });
  });

  describe("Caching Behavior", () => {
    beforeEach(() => {
      coachingManager = new CoachingManager({
        mode: "rule",
        enableCaching: true,
        maxCacheAge: 1000, // 1 second for testing
      });
    });

    it("should cache suggestions when caching is enabled", async () => {
      // First call
      await coachingManager.getSuggestions(mockShotFormData, mockRoast);

      // Second call should use cache
      await coachingManager.getSuggestions(mockShotFormData, mockRoast);

      expect(mockCoachingService.getSuggestions).toHaveBeenCalledTimes(1);
    });

    it("should bypass cache with force refresh", async () => {
      // First call
      await coachingManager.getSuggestions(mockShotFormData, mockRoast);

      // Second call with force refresh
      await coachingManager.getSuggestions(mockShotFormData, mockRoast, {
        forceRefresh: true,
      });

      expect(mockCoachingService.getSuggestions).toHaveBeenCalledTimes(2);
    });

    it("should bypass cache when useCache is false", async () => {
      // First call
      await coachingManager.getSuggestions(mockShotFormData, mockRoast);

      // Second call with useCache: false
      await coachingManager.getSuggestions(mockShotFormData, mockRoast, {
        useCache: false,
      });

      expect(mockCoachingService.getSuggestions).toHaveBeenCalledTimes(2);
    });

    it("should expire cache after maxCacheAge", async () => {
      // First call
      await coachingManager.getSuggestions(mockShotFormData, mockRoast);

      // Wait for cache to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Second call should generate new suggestions
      await coachingManager.getSuggestions(mockShotFormData, mockRoast);

      expect(mockCoachingService.getSuggestions).toHaveBeenCalledTimes(2);
    });

    it("should generate different cache keys for different parameters", async () => {
      const differentShotData: ShotFormData = {
        ...mockShotFormData,
        dose_g: "20.0", // Different dose
      };

      // Mock different hash values for different inputs
      mockGenerateInputHash
        .mockReturnValueOnce("hash-for-original")
        .mockReturnValueOnce("hash-for-different");

      // First call with original data
      await coachingManager.getSuggestions(mockShotFormData, mockRoast);

      // Second call with different data
      await coachingManager.getSuggestions(differentShotData, mockRoast);

      expect(mockCoachingService.getSuggestions).toHaveBeenCalledTimes(2);
    });

    it("should generate different cache keys for different roast levels", async () => {
      // Mock different hash values for different roast levels
      mockGenerateInputHash
        .mockReturnValueOnce("hash-for-medium")
        .mockReturnValueOnce("hash-for-light");

      // First call with Medium roast
      await coachingManager.getSuggestions(mockShotFormData, "Medium");

      // Second call with Light roast
      await coachingManager.getSuggestions(mockShotFormData, "Light");

      expect(mockCoachingService.getSuggestions).toHaveBeenCalledTimes(2);
    });
  });

  describe("Cache Key Generation", () => {
    beforeEach(() => {
      coachingManager = new CoachingManager({
        mode: "rule",
        enableCaching: true,
        maxCacheAge: 1000,
      });
    });

    it("should include all relevant parameters in cache key", async () => {
      await coachingManager.getSuggestions(mockShotFormData, mockRoast);

      expect(mockGenerateInputHash).toHaveBeenCalledWith({
        dose: 18.0,
        yield: 36.0,
        time: 30.0,
        ratio: 2.0,
        temp: 93.0,
        roast: "Medium",
        acidity: 0.5,
        bitterness: -0.3,
        body: 0.2,
        aftertaste: 0.1,
        version: COACHING_MODE_CONFIG.rule.version,
      });
    });

    it("should use correct cache prefix for rule mode", async () => {
      coachingManager = new CoachingManager({
        mode: "rule",
        enableCaching: true,
        maxCacheAge: 1000,
      });

      await coachingManager.getSuggestions(mockShotFormData, mockRoast);

      expect(mockGenerateInputHash).toHaveBeenCalledWith(
        expect.objectContaining({
          version: COACHING_MODE_CONFIG.rule.version,
        })
      );
    });

    it("should use correct cache prefix for AI mode", async () => {
      coachingManager = new CoachingManager({
        mode: "ai",
        enableCaching: true,
        maxCacheAge: 1000,
      });

      await coachingManager.getSuggestions(mockShotFormData, mockRoast);

      expect(mockGenerateInputHash).toHaveBeenCalledWith(
        expect.objectContaining({
          version: COACHING_MODE_CONFIG.ai.version,
        })
      );
    });

    it("should use correct cache prefix for hybrid mode", async () => {
      coachingManager = new CoachingManager({
        mode: "hybrid",
        enableCaching: true,
        maxCacheAge: 1000,
      });

      await coachingManager.getSuggestions(mockShotFormData, mockRoast);

      expect(mockGenerateInputHash).toHaveBeenCalledWith(
        expect.objectContaining({
          version: COACHING_MODE_CONFIG.hybrid.version,
        })
      );
    });
  });

  describe("Cache Management", () => {
    beforeEach(() => {
      coachingManager = new CoachingManager({
        mode: "rule",
        enableCaching: true,
        maxCacheAge: 1000,
      });
    });

    it("should clear cache", () => {
      coachingManager.clearCache();
      // No direct way to test cache clearing, but method should not throw
      expect(() => coachingManager.clearCache()).not.toThrow();
    });

    it("should return cache statistics", () => {
      const stats = coachingManager.getCacheStats();

      expect(stats).toHaveProperty("size");
      expect(stats).toHaveProperty("keys");
      expect(typeof stats.size).toBe("number");
      expect(Array.isArray(stats.keys)).toBe(true);
    });

    it("should track cache entries correctly", async () => {
      // Initially empty cache
      let stats = coachingManager.getCacheStats();
      expect(stats.size).toBe(0);

      // Mock different hash values for different inputs
      mockGenerateInputHash
        .mockReturnValueOnce("hash-for-first")
        .mockReturnValueOnce("hash-for-second");

      // Add one entry
      await coachingManager.getSuggestions(mockShotFormData, mockRoast);
      stats = coachingManager.getCacheStats();
      expect(stats.size).toBe(1);

      // Add another entry with different parameters
      const differentData = { ...mockShotFormData, dose_g: "20.0" };
      await coachingManager.getSuggestions(differentData, mockRoast);
      stats = coachingManager.getCacheStats();
      expect(stats.size).toBe(2);
    });
  });

  describe("Version Management", () => {
    it("should return correct version for rule mode", () => {
      coachingManager = new CoachingManager({
        mode: "rule",
        enableCaching: false,
        maxCacheAge: 1000,
      });

      expect(coachingManager.getVersion()).toBe(
        COACHING_MODE_CONFIG.rule.version
      );
    });

    it("should return correct version for AI mode", () => {
      coachingManager = new CoachingManager({
        mode: "ai",
        enableCaching: false,
        maxCacheAge: 1000,
      });

      expect(coachingManager.getVersion()).toBe(
        COACHING_MODE_CONFIG.ai.version
      );
    });

    it("should return correct version for hybrid mode", () => {
      coachingManager = new CoachingManager({
        mode: "hybrid",
        enableCaching: false,
        maxCacheAge: 1000,
      });

      expect(coachingManager.getVersion()).toBe(
        COACHING_MODE_CONFIG.hybrid.version
      );
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      coachingManager = new CoachingManager({
        mode: "rule",
        enableCaching: false,
        maxCacheAge: 1000,
      });
    });

    it("should handle coaching service errors", async () => {
      mockCoachingService.getSuggestions.mockRejectedValue(
        new Error("Service error")
      );

      await expect(
        coachingManager.getSuggestions(mockShotFormData, mockRoast)
      ).rejects.toThrow("Service error");
    });

    it("should handle hash generation errors", async () => {
      mockGenerateInputHash.mockImplementation(() => {
        throw new Error("Hash generation failed");
      });

      await expect(
        coachingManager.getSuggestions(mockShotFormData, mockRoast)
      ).rejects.toThrow("Hash generation failed");
    });

    it("should handle invalid shot form data", async () => {
      const invalidShotData = {
        ...mockShotFormData,
        dose_g: "invalid", // Invalid number - parseFloat returns NaN
      } as any;

      // Should handle gracefully (parseFloat returns NaN, not an error)
      const result = await coachingManager.getSuggestions(
        invalidShotData,
        mockRoast
      );

      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
      // The system should handle NaN values gracefully
    });
  });

  describe("Edge Cases", () => {
    beforeEach(() => {
      coachingManager = new CoachingManager({
        mode: "rule",
        enableCaching: false,
        maxCacheAge: 1000,
      });
    });

    it("should handle empty suggestions", async () => {
      mockCoachingService.getSuggestions.mockResolvedValue([]);

      const result = await coachingManager.getSuggestions(
        mockShotFormData,
        mockRoast
      );

      expect(result.suggestions).toEqual([]);
      expect(result.version).toBe(COACHING_MODE_CONFIG.rule.version);
    });

    it("should handle extreme shot parameters", async () => {
      const extremeData: ShotFormData = {
        ...mockShotFormData,
        dose_g: "50.0",
        yield_g: "10.0",
        shotTime_s: "60.0",
        ratio: "0.2",
        waterTemp_C: "100.0",
        acidity: 1.0,
        bitterness: 1.0,
        body: 1.0,
        aftertaste: 1.0,
      };

      const result = await coachingManager.getSuggestions(
        extremeData,
        mockRoast
      );

      expect(result).toBeDefined();
      expect(mockGenerateInputHash).toHaveBeenCalledWith(
        expect.objectContaining({
          dose: 50.0,
          yield: 10.0,
          time: 60.0,
          ratio: 0.2,
          temp: 100.0,
          acidity: 1.0,
          bitterness: 1.0,
          body: 1.0,
          aftertaste: 1.0,
        })
      );
    });

    it("should handle zero values", async () => {
      const zeroData: ShotFormData = {
        ...mockShotFormData,
        dose_g: "0",
        yield_g: "0",
        shotTime_s: "0",
        ratio: "0",
        waterTemp_C: "0",
        acidity: 0,
        bitterness: 0,
        body: 0,
        aftertaste: 0,
      };

      const result = await coachingManager.getSuggestions(zeroData, mockRoast);

      expect(result).toBeDefined();
      expect(mockGenerateInputHash).toHaveBeenCalledWith(
        expect.objectContaining({
          dose: 0,
          yield: 0,
          time: 0,
          ratio: 0,
          temp: 0,
          acidity: 0,
          bitterness: 0,
          body: 0,
          aftertaste: 0,
        })
      );
    });

    it("should handle negative values", async () => {
      const negativeData: ShotFormData = {
        ...mockShotFormData,
        acidity: -1.0,
        bitterness: -1.0,
        body: -1.0,
        aftertaste: -1.0,
      };

      const result = await coachingManager.getSuggestions(
        negativeData,
        mockRoast
      );

      expect(result).toBeDefined();
      expect(mockGenerateInputHash).toHaveBeenCalledWith(
        expect.objectContaining({
          acidity: -1.0,
          bitterness: -1.0,
          body: -1.0,
          aftertaste: -1.0,
        })
      );
    });
  });

  describe("Performance", () => {
    it("should handle multiple concurrent requests", async () => {
      coachingManager = new CoachingManager({
        mode: "rule",
        enableCaching: false,
        maxCacheAge: 1000,
      });

      const promises = Array(10)
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

      expect(results).toHaveLength(10);
      expect(mockCoachingService.getSuggestions).toHaveBeenCalledTimes(10);
    });

    it("should handle caching with concurrent requests", async () => {
      coachingManager = new CoachingManager({
        mode: "rule",
        enableCaching: true,
        maxCacheAge: 1000,
      });

      const mockSuggestions: Suggestion[] = [];
      mockCoachingService.getSuggestions.mockResolvedValue(mockSuggestions);

      // Mock the same hash for all concurrent requests
      mockGenerateInputHash.mockReturnValue("same-hash-for-all");

      // First, make one request to populate the cache
      await coachingManager.getSuggestions(mockShotFormData, mockRoast);
      expect(mockCoachingService.getSuggestions).toHaveBeenCalledTimes(1);

      // Reset the mock call count
      mockCoachingService.getSuggestions.mockClear();

      // Multiple concurrent requests with same parameters should use cache
      const promises = Array(5)
        .fill(null)
        .map(() => coachingManager.getSuggestions(mockShotFormData, mockRoast));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      // After cache is populated, concurrent requests should not call the service again
      expect(mockCoachingService.getSuggestions).toHaveBeenCalledTimes(0);
    });
  });
});
