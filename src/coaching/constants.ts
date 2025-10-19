/** Thresholds for detecting significant taste imbalances (scale: -1 to 1) */
export const THRESHOLDS = {
  /** Threshold for triggering coaching suggestions */
  SIGNIFICANT_IMBALANCE: 0.5,
  /** Magnitude for high confidence classification */
  HIGH_CONFIDENCE_MAGNITUDE: 0.9,
  /** Magnitude for medium confidence classification */
  MED_CONFIDENCE_MAGNITUDE: 0.5,
} as const;

/**
 * Roast-specific threshold adjustments
 * Light roasts are more sensitive to extraction issues, dark roasts are more forgiving
 */
export const ROAST_THRESHOLDS = {
  Light: { imbalanceThreshold: 0.1 }, // More sensitive
  "Medium Light": { imbalanceThreshold: 0.15 }, // Slightly sensitive
  Medium: { imbalanceThreshold: 0.2 }, // Standard
  "Medium Dark": { imbalanceThreshold: 0.25 }, // More tolerant
  Dark: { imbalanceThreshold: 0.3 }, // Most tolerant
} as const;

/** Default adjustment amounts for each parameter */
export const DEFAULT_DELTAS = {
  grindStep: 1, // steps on grinder
  dose_g: 0.3, // grams
  shotTime_s: 2, // seconds
  waterTemp_C: 1, // degrees Celsius
  ratio: 0.2, // ratio points (e.g., 2.0 → 2.2)
} as const;

/** Maximum allowed adjustments to prevent extreme suggestions */
export const MAX_DELTAS = {
  waterTemp_C: 2, // ±2°C
  shotTime_s: 4, // ±4s
  grindStep: 2, // ±2 steps
  dose_g: 0.5, // ±0.5g
  ratio: { min: 1.5, max: 2.6 },
} as const;

/** Extraction classification bands and deadband */
export const EXTRACTION_BANDS = {
  under: -0.6,
  slightlyUnder: -0.2,
  slightlyOver: 0.2,
  over: 0.6,
} as const;

export const DEAD_BAND = 0.05; // hysteresis to reduce label flicker
