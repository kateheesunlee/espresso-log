// Centralized version management for coaching and extraction systems
// This ensures consistent versioning across all snapshot generation

// ============================================================================
// Version Constants
// ============================================================================

/** Current version of the extraction analysis system */
export const EXTRACTION_VERSION = 'extract-2025.01.15';

/** Current version of the rule-based coaching system */
export const RULE_COACHING_VERSION = 'coach-rule-v4';

/** Current version of the AI coaching system */
export const AI_COACHING_VERSION = 'coach-ai-v1';

/** Current version of the hybrid coaching system */
export const HYBRID_COACHING_VERSION = 'coach-hybrid-v1';

// ============================================================================
// Version History & Migration Support
// ============================================================================

export interface VersionInfo {
  version: string;
  releaseDate: string;
  description: string;
  breakingChanges?: boolean;
}

/** Extraction system version history */
export const EXTRACTION_VERSIONS: Record<string, VersionInfo> = {
  'extract-2025.01.15': {
    version: 'extract-2025.01.15',
    releaseDate: '2025-01-15',
    description:
      'Improved confidence calculation and roast-specific adjustments',
    breakingChanges: false,
  },
  'extract-2025.10.03': {
    version: 'extract-2025.10.03',
    releaseDate: '2025-10-03',
    description: 'Initial extraction classification system',
    breakingChanges: false,
  },
};

/** Coaching system version history */
export const COACHING_VERSIONS: Record<string, VersionInfo> = {
  'coach-hybrid-v1': {
    version: 'coach-hybrid-v1',
    releaseDate: '2025-01-15',
    description: 'Hybrid rule-based and AI coaching system',
    breakingChanges: false,
  },
  'coach-ai-v1': {
    version: 'coach-ai-v1',
    releaseDate: '2025-01-15',
    description: 'AI-powered coaching suggestions',
    breakingChanges: false,
  },
  'coach-rule-v4': {
    version: 'coach-rule-v4',
    releaseDate: '2025-01-10',
    description: 'Enhanced rule-based coaching with better prioritization',
    breakingChanges: false,
  },
  'coach-rule-v3': {
    version: 'coach-rule-v3',
    releaseDate: '2024-12-20',
    description: 'Improved roast-specific thresholds and suggestion quality',
    breakingChanges: false,
  },
};

// ============================================================================
// Version Management Utilities
// ============================================================================

/** Generate a deterministic hash for input parameters */
export function generateInputHash(params: Record<string, any>): string {
  // Sort keys for consistent hashing
  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (result, key) => {
        result[key] = params[key];
        return result;
      },
      {} as Record<string, any>
    );

  // Simple hash function (you could use a more sophisticated one if needed)
  const str = JSON.stringify(sortedParams);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `hash-${Math.abs(hash).toString(36)}`;
}

/** Get version info for a given version string */
export function getVersionInfo(version: string): VersionInfo | undefined {
  return EXTRACTION_VERSIONS[version] || COACHING_VERSIONS[version];
}

/** Check if a version has breaking changes */
export function hasBreakingChanges(version: string): boolean {
  const info = getVersionInfo(version);
  return info?.breakingChanges || false;
}

/** Get all supported versions for a system type */
export function getSupportedVersions(
  systemType: 'extraction' | 'coaching'
): string[] {
  if (systemType === 'extraction') {
    return Object.keys(EXTRACTION_VERSIONS);
  } else {
    return Object.keys(COACHING_VERSIONS);
  }
}

// ============================================================================
// Version-Specific Configuration
// ============================================================================

/** Configuration for different coaching modes */
export const COACHING_MODE_CONFIG = {
  rule: {
    version: RULE_COACHING_VERSION,
    cachePrefix: 'rule',
    maxSuggestions: 3,
  },
  ai: {
    version: AI_COACHING_VERSION,
    cachePrefix: 'ai',
    maxSuggestions: 3,
  },
  hybrid: {
    version: HYBRID_COACHING_VERSION,
    cachePrefix: 'hybrid',
    maxSuggestions: 3,
  },
} as const;

/** Configuration for extraction system */
export const EXTRACTION_CONFIG = {
  version: EXTRACTION_VERSION,
  cachePrefix: 'extract',
  supportedRoasts: [
    'Light',
    'Medium Light',
    'Medium',
    'Medium Dark',
    'Dark',
  ] as const,
} as const;

// ============================================================================
// Migration & Validation Utilities
// ============================================================================

/** Check if a snapshot needs to be regenerated due to version changes */
export function shouldRegenerateSnapshot(
  currentVersion: string,
  storedVersion: string,
  systemType: 'extraction' | 'coaching'
): boolean {
  // If versions are the same, no regeneration needed
  if (currentVersion === storedVersion) {
    return false;
  }

  // Check if the stored version has breaking changes
  const storedVersionInfo = getVersionInfo(storedVersion);
  if (storedVersionInfo?.breakingChanges) {
    return true;
  }

  // For extraction system, regenerate if version is older
  if (systemType === 'extraction') {
    const currentInfo = getVersionInfo(currentVersion);
    const storedInfo = getVersionInfo(storedVersion);

    if (currentInfo && storedInfo) {
      // Simple date comparison (you could make this more sophisticated)
      return (
        new Date(currentInfo.releaseDate) > new Date(storedInfo.releaseDate)
      );
    }
  }

  // For coaching, regenerate if switching between different engines
  if (systemType === 'coaching') {
    const currentEngine = currentVersion.split('-')[1]; // Extract engine type
    const storedEngine = storedVersion.split('-')[1];
    return currentEngine !== storedEngine;
  }

  return false;
}

/** Get the latest version for a system type */
export function getLatestVersion(
  systemType: 'extraction' | 'coaching'
): string {
  if (systemType === 'extraction') {
    return EXTRACTION_CONFIG.version;
  } else {
    // Return the rule version as default (most stable)
    return COACHING_MODE_CONFIG.rule.version;
  }
}

/** Validate that a version is supported */
export function isVersionSupported(
  version: string,
  systemType: 'extraction' | 'coaching'
): boolean {
  const supportedVersions = getSupportedVersions(systemType);
  return supportedVersions.includes(version);
}
