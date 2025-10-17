// Coaching Manager - Handles coaching generation
// Note: In-memory caching is kept for future use, but not necessary for current workflow
// since coaching results are stored permanently in shot snapshots
import { ShotFormData, RoastLevel, Suggestion, CoachingSnapshot } from "@types";
import { CoachingService } from "./CoachingService";
import { COACHING_MODE_CONFIG, generateInputHash } from "../versions";

interface CoachingConfig {
  mode: "rule" | "ai" | "hybrid";
  aiApiKey?: string;
  enableCaching: boolean; // Useful for on-demand coaching or real-time suggestions
  maxCacheAge: number; // in milliseconds
}

interface CoachingCache {
  [key: string]: {
    suggestions: Suggestion[];
    timestamp: number;
    version: string;
  };
}

export class CoachingManager {
  private coachingService: CoachingService;
  private cache: CoachingCache = {};
  private config: CoachingConfig;

  constructor(config: CoachingConfig) {
    this.config = config;
    this.coachingService = new CoachingService(config.mode, config.aiApiKey);
  }

  async getSuggestions(
    shotFormData: ShotFormData,
    roast: RoastLevel,
    options: {
      forceRefresh?: boolean;
      useCache?: boolean; // Note: Caching is mainly for future on-demand coaching features
    } = {}
  ): Promise<CoachingSnapshot> {
    const { forceRefresh = false, useCache = true } = options;

    // Generate cache key based on shot parameters
    const cacheKey = this.generateCacheKey(shotFormData, roast);

    // Check cache first (unless force refresh)
    if (!forceRefresh && useCache && this.config.enableCaching) {
      const cached = this.getCachedSuggestions(cacheKey);
      if (cached) {
        return {
          version: this.getVersion(),
          suggestions: cached,
          inputHash: cacheKey,
          computedAt: new Date().toISOString(),
        };
      }
    }

    // Generate new suggestions
    const suggestions = await this.coachingService.getSuggestions(
      shotFormData,
      roast
    );

    // Cache the results
    if (useCache && this.config.enableCaching) {
      this.cacheSuggestions(cacheKey, suggestions);
    }

    return {
      version: this.getVersion(),
      suggestions,
      inputHash: cacheKey,
      computedAt: new Date().toISOString(),
    };
  }

  private generateCacheKey(
    shotFormData: ShotFormData,
    roast: RoastLevel
  ): string {
    // Create a hash of the key parameters that affect coaching
    const keyParams = {
      // extraction parameters
      grind: parseFloat(shotFormData.grindSetting),
      dose: parseFloat(shotFormData.dose_g),
      yield: parseFloat(shotFormData.yield_g),
      ratio: parseFloat(shotFormData.ratio),
      // advanced parameters
      time:
        shotFormData.shotTime_s && shotFormData.shotTime_s.trim() !== ""
          ? parseFloat(shotFormData.shotTime_s)
          : undefined,
      temp: shotFormData.waterTemp_C
        ? parseFloat(shotFormData.waterTemp_C)
        : undefined,
      // roast and taste profile
      roast,
      acidity: shotFormData.acidity,
      bitterness: shotFormData.bitterness,
      body: shotFormData.body,
      aftertaste: shotFormData.aftertaste,
      version: this.getVersion(), // Include version in cache key for invalidation
    };

    const hash = generateInputHash(keyParams);
    const prefix = COACHING_MODE_CONFIG[this.config.mode].cachePrefix;
    return `${prefix}-${hash}`;
  }

  private getCachedSuggestions(cacheKey: string): Suggestion[] | null {
    const cached = this.cache[cacheKey];
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.config.maxCacheAge) {
      delete this.cache[cacheKey];
      return null;
    }

    return cached.suggestions;
  }

  private cacheSuggestions(cacheKey: string, suggestions: Suggestion[]): void {
    this.cache[cacheKey] = {
      suggestions,
      timestamp: Date.now(),
      version: this.getVersion(),
    };
  }

  getVersion(): string {
    return COACHING_MODE_CONFIG[this.config.mode].version;
  }

  // Clear cache (useful for testing or when switching modes)
  clearCache(): void {
    this.cache = {};
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: Object.keys(this.cache).length,
      keys: Object.keys(this.cache),
    };
  }
}
