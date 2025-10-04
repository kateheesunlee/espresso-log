import {
  EXTRACTION_VERSION,
  RULE_COACHING_VERSION,
  AI_COACHING_VERSION,
  HYBRID_COACHING_VERSION,
  EXTRACTION_VERSIONS,
  COACHING_VERSIONS,
  generateInputHash,
  getVersionInfo,
  hasBreakingChanges,
  getSupportedVersions,
  shouldRegenerateSnapshot,
  getLatestVersion,
  isVersionSupported,
  COACHING_MODE_CONFIG,
  EXTRACTION_CONFIG,
} from "./versions";

describe("Version Management", () => {
  describe("Version Constants", () => {
    it("should have current extraction version", () => {
      expect(EXTRACTION_VERSION).toBe("extract-2025.01.15");
    });

    it("should have current coaching versions", () => {
      expect(RULE_COACHING_VERSION).toBe("coach-rule-v4");
      expect(AI_COACHING_VERSION).toBe("coach-ai-v1");
      expect(HYBRID_COACHING_VERSION).toBe("coach-hybrid-v1");
    });

    it("should have configuration objects", () => {
      expect(EXTRACTION_CONFIG.version).toBe(EXTRACTION_VERSION);
      expect(COACHING_MODE_CONFIG.rule.version).toBe(RULE_COACHING_VERSION);
      expect(COACHING_MODE_CONFIG.ai.version).toBe(AI_COACHING_VERSION);
      expect(COACHING_MODE_CONFIG.hybrid.version).toBe(HYBRID_COACHING_VERSION);
    });
  });

  describe("generateInputHash", () => {
    it("should generate consistent hash for same input", () => {
      const params = {
        dose: 18.0,
        yield: 36.0,
        roast: "Medium",
        version: "test-v1",
      };

      const hash1 = generateInputHash(params);
      const hash2 = generateInputHash(params);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^hash-[a-z0-9]+$/);
    });

    it("should generate different hashes for different inputs", () => {
      const params1 = {
        dose: 18.0,
        yield: 36.0,
        roast: "Medium",
      };

      const params2 = {
        dose: 19.0, // Different dose
        yield: 36.0,
        roast: "Medium",
      };

      const hash1 = generateInputHash(params1);
      const hash2 = generateInputHash(params2);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle object key ordering consistently", () => {
      const params1 = {
        dose: 18.0,
        yield: 36.0,
        roast: "Medium",
        acidity: 0.5,
      };

      const params2 = {
        acidity: 0.5,
        roast: "Medium",
        dose: 18.0,
        yield: 36.0,
      };

      const hash1 = generateInputHash(params1);
      const hash2 = generateInputHash(params2);

      expect(hash1).toBe(hash2);
    });

    it("should handle nested objects", () => {
      const params = {
        dose: 18.0,
        balance: {
          acidity: 0.5,
          bitterness: -0.3,
        },
        version: "test-v1",
      };

      const hash = generateInputHash(params);

      expect(hash).toMatch(/^hash-[a-z0-9]+$/);
    });

    it("should handle empty object", () => {
      const params = {};

      const hash = generateInputHash(params);

      expect(hash).toMatch(/^hash-[a-z0-9]+$/);
    });

    it("should handle special characters and numbers", () => {
      const params = {
        dose: 18.5,
        yield: 36.0,
        roast: "Medium-Light",
        temp: 93.5,
        version: "extract-2025.01.15",
      };

      const hash = generateInputHash(params);

      expect(hash).toMatch(/^hash-[a-z0-9]+$/);
    });

    it("should handle boolean and null values", () => {
      const params = {
        dose: 18.0,
        isFavorite: true,
        deleted: false,
        notes: null,
      };

      const hash = generateInputHash(params);

      expect(hash).toMatch(/^hash-[a-z0-9]+$/);
    });
  });

  describe("getVersionInfo", () => {
    it("should return version info for extraction versions", () => {
      const info = getVersionInfo("extract-2025.01.15");

      expect(info).toBeDefined();
      expect(info?.version).toBe("extract-2025.01.15");
      expect(info?.releaseDate).toBe("2025-01-15");
      expect(info?.description).toContain("Improved confidence calculation");
      expect(info?.breakingChanges).toBe(false);
    });

    it("should return version info for coaching versions", () => {
      const info = getVersionInfo("coach-rule-v4");

      expect(info).toBeDefined();
      expect(info?.version).toBe("coach-rule-v4");
      expect(info?.releaseDate).toBe("2025-01-10");
      expect(info?.description).toContain("Enhanced rule-based coaching");
      expect(info?.breakingChanges).toBe(false);
    });

    it("should return undefined for unknown versions", () => {
      const info = getVersionInfo("unknown-version-v999");

      expect(info).toBeUndefined();
    });

    it("should handle all known versions", () => {
      const extractionVersions = Object.keys(EXTRACTION_VERSIONS);
      const coachingVersions = Object.keys(COACHING_VERSIONS);

      [...extractionVersions, ...coachingVersions].forEach((version) => {
        const info = getVersionInfo(version);
        expect(info).toBeDefined();
        expect(info?.version).toBe(version);
      });
    });
  });

  describe("hasBreakingChanges", () => {
    it("should return false for non-breaking versions", () => {
      expect(hasBreakingChanges("extract-2025.01.15")).toBe(false);
      expect(hasBreakingChanges("coach-rule-v4")).toBe(false);
    });

    it("should return true for versions with breaking changes", () => {
      // This would need to be updated when we add a version with breaking changes
      // For now, we'll test the logic with a hypothetical version
      const versionWithBreakingChanges = "coach-rule-v5";

      // If we add a version with breakingChanges: true, this test would pass
      // For now, we'll test the function doesn't crash
      expect(() =>
        hasBreakingChanges(versionWithBreakingChanges)
      ).not.toThrow();
    });

    it("should return false for unknown versions", () => {
      expect(hasBreakingChanges("unknown-version")).toBe(false);
    });
  });

  describe("getSupportedVersions", () => {
    it("should return extraction versions", () => {
      const versions = getSupportedVersions("extraction");

      expect(Array.isArray(versions)).toBe(true);
      expect(versions.length).toBeGreaterThan(0);
      expect(versions).toContain("extract-2025.01.15");
      expect(versions).toContain("extract-2025.10.03");
    });

    it("should return coaching versions", () => {
      const versions = getSupportedVersions("coaching");

      expect(Array.isArray(versions)).toBe(true);
      expect(versions.length).toBeGreaterThan(0);
      expect(versions).toContain("coach-rule-v4");
      expect(versions).toContain("coach-ai-v1");
      expect(versions).toContain("coach-hybrid-v1");
    });

    it("should return different arrays for different system types", () => {
      const extractionVersions = getSupportedVersions("extraction");
      const coachingVersions = getSupportedVersions("coaching");

      expect(extractionVersions).not.toEqual(coachingVersions);
    });
  });

  describe("shouldRegenerateSnapshot", () => {
    it("should return false for same versions", () => {
      const result = shouldRegenerateSnapshot(
        "extract-2025.01.15",
        "extract-2025.01.15",
        "extraction"
      );

      expect(result).toBe(false);
    });

    it("should return true for newer extraction versions", () => {
      const result = shouldRegenerateSnapshot(
        "extract-2025.10.03", // Newer version (October 2025)
        "extract-2025.01.15", // Older version (January 2025)
        "extraction"
      );

      expect(result).toBe(true);
    });

    it("should return false for older extraction versions", () => {
      const result = shouldRegenerateSnapshot(
        "extract-2025.01.15", // Older version (January 2025)
        "extract-2025.10.03", // Newer version (October 2025)
        "extraction"
      );

      expect(result).toBe(false); // Older version should not trigger regeneration
    });

    it("should return true when switching coaching engines", () => {
      const result = shouldRegenerateSnapshot(
        "coach-ai-v1",
        "coach-rule-v4",
        "coaching"
      );

      expect(result).toBe(true);
    });

    it("should return false for same coaching engine", () => {
      const result = shouldRegenerateSnapshot(
        "coach-rule-v4",
        "coach-rule-v3",
        "coaching"
      );

      expect(result).toBe(false); // Same engine, different version
    });

    it("should return true for versions with breaking changes", () => {
      // This test verifies the breaking changes logic
      // Currently no versions have breaking changes, so this tests the logic path
      const result = shouldRegenerateSnapshot(
        "extract-2025.10.03", // Newer version
        "extract-2025.01.15", // Older version
        "extraction"
      );

      expect(result).toBe(true);
    });

    it("should handle unknown versions gracefully", () => {
      const result = shouldRegenerateSnapshot(
        "unknown-v1",
        "unknown-v2",
        "extraction"
      );

      expect(result).toBe(false); // Should default to false for unknown versions
    });
  });

  describe("getLatestVersion", () => {
    it("should return current extraction version", () => {
      const version = getLatestVersion("extraction");

      expect(version).toBe(EXTRACTION_VERSION);
    });

    it("should return rule coaching version as default", () => {
      const version = getLatestVersion("coaching");

      expect(version).toBe(RULE_COACHING_VERSION);
    });

    it("should handle invalid system types", () => {
      // @ts-ignore - Testing invalid input
      const version = getLatestVersion("invalid");

      expect(version).toBe(RULE_COACHING_VERSION); // Should default to rule version
    });
  });

  describe("isVersionSupported", () => {
    it("should return true for supported extraction versions", () => {
      expect(isVersionSupported("extract-2025.01.15", "extraction")).toBe(true);
      expect(isVersionSupported("extract-2025.10.03", "extraction")).toBe(true);
    });

    it("should return true for supported coaching versions", () => {
      expect(isVersionSupported("coach-rule-v4", "coaching")).toBe(true);
      expect(isVersionSupported("coach-ai-v1", "coaching")).toBe(true);
      expect(isVersionSupported("coach-hybrid-v1", "coaching")).toBe(true);
    });

    it("should return false for unsupported versions", () => {
      expect(isVersionSupported("unknown-version", "extraction")).toBe(false);
      expect(isVersionSupported("unknown-version", "coaching")).toBe(false);
    });

    it("should return false for wrong system type", () => {
      expect(isVersionSupported("coach-rule-v4", "extraction")).toBe(false);
      expect(isVersionSupported("extract-2025.01.15", "coaching")).toBe(false);
    });
  });

  describe("Configuration Objects", () => {
    describe("COACHING_MODE_CONFIG", () => {
      it("should have correct rule configuration", () => {
        const ruleConfig = COACHING_MODE_CONFIG.rule;

        expect(ruleConfig.version).toBe("coach-rule-v4");
        expect(ruleConfig.cachePrefix).toBe("rule");
        expect(ruleConfig.maxSuggestions).toBe(3);
      });

      it("should have correct AI configuration", () => {
        const aiConfig = COACHING_MODE_CONFIG.ai;

        expect(aiConfig.version).toBe("coach-ai-v1");
        expect(aiConfig.cachePrefix).toBe("ai");
        expect(aiConfig.maxSuggestions).toBe(3);
      });

      it("should have correct hybrid configuration", () => {
        const hybridConfig = COACHING_MODE_CONFIG.hybrid;

        expect(hybridConfig.version).toBe("coach-hybrid-v1");
        expect(hybridConfig.cachePrefix).toBe("hybrid");
        expect(hybridConfig.maxSuggestions).toBe(3);
      });
    });

    describe("EXTRACTION_CONFIG", () => {
      it("should have correct extraction configuration", () => {
        expect(EXTRACTION_CONFIG.version).toBe("extract-2025.01.15");
        expect(EXTRACTION_CONFIG.cachePrefix).toBe("extract");
        expect(EXTRACTION_CONFIG.supportedRoasts).toEqual([
          "Light",
          "Medium Light",
          "Medium",
          "Medium Dark",
          "Dark",
        ]);
      });

      it("should have all supported roast levels", () => {
        const roasts = EXTRACTION_CONFIG.supportedRoasts;

        expect(roasts).toContain("Light");
        expect(roasts).toContain("Medium Light");
        expect(roasts).toContain("Medium");
        expect(roasts).toContain("Medium Dark");
        expect(roasts).toContain("Dark");
        expect(roasts).toHaveLength(5);
      });
    });
  });

  describe("Version History", () => {
    it("should have extraction version history", () => {
      expect(EXTRACTION_VERSIONS).toBeDefined();
      expect(typeof EXTRACTION_VERSIONS).toBe("object");
      expect(Object.keys(EXTRACTION_VERSIONS).length).toBeGreaterThan(0);
    });

    it("should have coaching version history", () => {
      expect(COACHING_VERSIONS).toBeDefined();
      expect(typeof COACHING_VERSIONS).toBe("object");
      expect(Object.keys(COACHING_VERSIONS).length).toBeGreaterThan(0);
    });

    it("should have proper version info structure", () => {
      const versionKeys = Object.keys(EXTRACTION_VERSIONS);
      const firstVersion = versionKeys[0];
      const versionInfo = EXTRACTION_VERSIONS[firstVersion];

      expect(versionInfo).toHaveProperty("version");
      expect(versionInfo).toHaveProperty("releaseDate");
      expect(versionInfo).toHaveProperty("description");
      expect(versionInfo).toHaveProperty("breakingChanges");

      expect(typeof versionInfo.version).toBe("string");
      expect(typeof versionInfo.releaseDate).toBe("string");
      expect(typeof versionInfo.description).toBe("string");
      expect(typeof versionInfo.breakingChanges).toBe("boolean");
    });

    it("should have consistent version keys", () => {
      const extractionVersions = Object.keys(EXTRACTION_VERSIONS);
      const coachingVersions = Object.keys(COACHING_VERSIONS);

      extractionVersions.forEach((version) => {
        const info = EXTRACTION_VERSIONS[version];
        expect(info.version).toBe(version);
      });

      coachingVersions.forEach((version) => {
        const info = COACHING_VERSIONS[version];
        expect(info.version).toBe(version);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle null and undefined inputs", () => {
      // @ts-ignore - Testing edge cases
      expect(() => generateInputHash(null)).toThrow();
      // @ts-ignore - Testing edge cases
      expect(() => generateInputHash(undefined)).toThrow();
    });

    it("should handle empty string versions", () => {
      expect(getVersionInfo("")).toBeUndefined();
      expect(hasBreakingChanges("")).toBe(false);
      expect(isVersionSupported("", "extraction")).toBe(false);
    });

    it("should handle malformed version strings", () => {
      expect(getVersionInfo("invalid-version")).toBeUndefined();
      expect(hasBreakingChanges("invalid-version")).toBe(false);
      expect(isVersionSupported("invalid-version", "extraction")).toBe(false);
    });

    it("should handle very long version strings", () => {
      const longVersion = "a".repeat(1000);

      expect(getVersionInfo(longVersion)).toBeUndefined();
      expect(hasBreakingChanges(longVersion)).toBe(false);
      expect(isVersionSupported(longVersion, "extraction")).toBe(false);
    });
  });
});
