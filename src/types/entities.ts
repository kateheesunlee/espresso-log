import { RoastLevel, TastingTag, AromaTag } from "./enums";

// ============================================================================
// Core Entity Types
// ============================================================================

export interface User {
  id: string;
  displayName?: string;
  createdAt: string;
}

export interface Machine {
  id: string;
  userId: string;
  brand: string;
  model: string;
  nickname?: string;
  grinder?: string;
  imageUri?: string;
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BeanDateEntry {
  id: string;
  date: string; // ISO string
  type: "roasting" | "opening";
}

export interface Bean {
  id: string;
  userId: string;
  name: string;
  origin?: string;
  process?: string;
  roastLevel?: RoastLevel;
  roastDate?: string; // Deprecated. Keep for backward compatibility
  dates: BeanDateEntry[]; // New array of date entries
  expirationPeriodWeeks: number; // 1-4 weeks
  aromaTags?: string[]; // Allow custom tags beyond predefined AromaTag enum
  imageUri?: string;
  isFavorite?: boolean;
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Shared Utility Types
// ============================================================================

/** Confidence levels used across coaching and extraction systems */
export type ConfidenceLevel = "low" | "med" | "high";

/** Taste balance values for rating sliders */
export type BalanceVal = -1 | -0.5 | 0 | 0.5 | 1;

/** Taste balance interface for shot rating */
export interface TasteBalance {
  acidity?: number;
  bitterness?: number;
  body?: number;
  aftertaste?: number;
}

// ============================================================================
// Coaching System Types
// ============================================================================

/** Fields that can be adjusted for shot optimization */
export type CoachField =
  | "grindStep"
  | "dose_g"
  | "ratio"
  | "shotTime_s"
  | "waterTemp_C"
  | "preinfusion_s";

/** Coaching suggestion from rule engine or AI */
export interface Suggestion {
  field: CoachField;
  delta?: number;
  target?: number;
  reason: string;
  priority: number;
  confidence: ConfidenceLevel;
  source: "rule" | "ai";
}

// Note: ShotInput removed - use individual parameters for better clarity

// ============================================================================
// Extraction System Types
// ============================================================================

/** Classification of extraction quality */
export type ExtractionClass =
  | "under"
  | "slightly-under"
  | "balanced"
  | "slightly-over"
  | "over";

/** Summary of extraction analysis */
export interface ExtractionSummary {
  score: number; // -1..1
  label: ExtractionClass;
  confidence: ConfidenceLevel;
  reason: string;
}

/** Snapshot of extraction analysis for historical data */
export interface ExtractionSnapshot extends ExtractionSummary {
  version: string; // "extract-2025.10.03"
  basedOn: {
    // Input values used for calculation (for reproducibility)
    // extraction parameters
    grindSetting: number;
    dose_g: number;
    yield_g: number;
    ratio: number;
    // advanced parameters
    shotTime_s?: number;
    waterTemp_C?: number;
    // roast and taste profile
    roast: RoastLevel;
    balance: TasteBalance; // Use consolidated TasteBalance interface
  };
  inputHash: string; // Hash of basedOn (for identity checking)
  computedAt: string; // ISO timestamp
}

/** Snapshot of coaching suggestions for historical data */
export interface CoachingSnapshot {
  version: string; // "coach-rule-v4"
  suggestions: Suggestion[]; // Final 1-3 suggestions for UI
  inputHash: string;
  computedAt: string;
}
// ============================================================================
// Shot Types
// ============================================================================

/** Form data structure for shot creation/editing (all string values for TextInput) */
export interface ShotFormData {
  beanId: string;
  machineId: string;
  dose_g: string; // TextInput value
  yield_g: string; // TextInput value
  ratio: string; // TextInput value
  shotTime_s: string; // TextInput value (empty string when not provided)
  grindSetting: string; // TextInput value
  waterTemp_C: string; // TextInput value
  preinfusion_s: string; // TextInput value
  rating: number; // Slider value
  acidity: number; // Slider value
  bitterness: number; // Slider value
  body: number; // Slider value
  aftertaste: number; // Slider value
  tastingTags: TastingTag[];
  notes: string;
  isFavorite: boolean;
}

/** Complete shot entity with parsed numeric values and snapshots */
export interface Shot
  extends Omit<
    ShotFormData,
    | "dose_g"
    | "yield_g"
    | "ratio"
    | "shotTime_s"
    | "grindSetting"
    | "waterTemp_C"
    | "preinfusion_s"
    | "rating"
    | "acidity"
    | "bitterness"
    | "body"
    | "aftertaste"
  > {
  id: string;
  userId: string;
  grindSetting: number;
  dose_g: number;
  yield_g: number;
  ratio: number;
  shotTime_s?: number; // Optional
  waterTemp_C?: number; // Optional
  preinfusion_s?: number; // Optional
  rating: number;
  acidity: number;
  bitterness: number;
  body: number;
  aftertaste: number;
  // Analysis snapshots
  extractionSnapshot?: ExtractionSnapshot;
  coachingSnapshot?: CoachingSnapshot;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

/** Convert form data to shot entity (excluding snapshots) */
export const shotFormDataToShot = (
  formData: ShotFormData,
  id?: string,
  userId?: string
): Omit<Shot, "extractionSnapshot" | "coachingSnapshot"> => ({
  id: id || `shot-${Date.now()}`,
  userId: userId || "default-user",
  beanId: formData.beanId,
  machineId: formData.machineId,
  dose_g: parseFloat(formData.dose_g),
  yield_g: parseFloat(formData.yield_g),
  shotTime_s:
    formData.shotTime_s && formData.shotTime_s.trim() !== ""
      ? parseFloat(formData.shotTime_s)
      : undefined,
  ratio: parseFloat(formData.ratio),
  grindSetting: parseFloat(formData.grindSetting),
  waterTemp_C: parseFloat(formData.waterTemp_C),
  preinfusion_s: parseFloat(formData.preinfusion_s),
  rating: formData.rating,
  acidity: formData.acidity,
  bitterness: formData.bitterness,
  body: formData.body,
  aftertaste: formData.aftertaste,
  tastingTags: formData.tastingTags,
  notes: formData.notes,
  isFavorite: formData.isFavorite,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/** Convert shot entity back to form data for editing */
export const shotToShotFormData = (shot: Shot): ShotFormData => ({
  beanId: shot.beanId,
  machineId: shot.machineId,
  // extraction parameters
  grindSetting: shot.grindSetting.toString(),
  dose_g: shot.dose_g.toString(),
  yield_g: shot.yield_g.toString(),
  ratio: shot.ratio.toString(),
  // advanced parameters
  shotTime_s: shot.shotTime_s?.toString() || "",
  waterTemp_C: shot.waterTemp_C?.toString() || "",
  preinfusion_s: shot.preinfusion_s?.toString() || "",
  // tasting notes
  acidity: shot.acidity,
  bitterness: shot.bitterness,
  body: shot.body,
  aftertaste: shot.aftertaste,
  tastingTags: shot.tastingTags,
  rating: shot.rating,
  notes: shot.notes,
  isFavorite: shot.isFavorite,
});

// ============================================================================
// Bean Date Management Utilities
// ============================================================================

/** Get the last date entry for a bean (final entry in the dates array) */
export const getLastBeanDate = (bean: Bean): BeanDateEntry | null => {
  if (!bean.dates || bean.dates.length === 0) {
    return null;
  }
  // Return the last entry in the array (most recently added)
  return bean.dates[bean.dates.length - 1];
};

/** Calculate freshness status based on latest date and expiration period */
export const getBeanFreshnessStatus = (
  bean: Bean
): {
  status: "fresh" | "still-okay" | "past-prime" | "too old";
  daysRemaining: number;
  progress: number; // 0-1 for slider
} => {
  const lastEntry = getLastBeanDate(bean);
  if (!lastEntry || !bean.expirationPeriodWeeks) {
    return { status: "fresh", daysRemaining: 0, progress: 0 };
  }

  // Use normalized date to avoid timezone issues
  const normalizedDate = normalizeDateForStorage(lastEntry.date);
  const [year, month, day] = normalizedDate.split("-").map(Number);
  const dateEntry = new Date(year, month - 1, day);

  const now = new Date();
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const expirationDate = new Date(
    dateEntry.getTime() + bean.expirationPeriodWeeks * 7 * 24 * 60 * 60 * 1000
  );

  const totalDays = bean.expirationPeriodWeeks * 7;
  const daysSinceDate = Math.floor(
    (nowDate.getTime() - dateEntry.getTime()) / (24 * 60 * 60 * 1000)
  );
  const daysRemaining = Math.max(
    0,
    Math.floor(
      (expirationDate.getTime() - nowDate.getTime()) / (24 * 60 * 60 * 1000)
    )
  );
  const progress = Math.min(1, daysSinceDate / totalDays);

  let status: "fresh" | "still-okay" | "past-prime" | "too old";
  if (daysRemaining === 0) {
    status = "too old";
  } else if (progress <= 0.25) {
    status = "fresh";
  } else if (progress <= 0.75) {
    status = "still-okay";
  } else {
    status = "past-prime";
  }

  return { status, daysRemaining, progress };
};

/** Create a new bean date entry */
export const createBeanDateEntry = (
  date: string,
  type: "roasting" | "opening"
): BeanDateEntry => ({
  id: `date-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  date,
  type,
});

/** Convert a Date object to a date-only string (YYYY-MM-DD) to avoid timezone issues */
export const dateToDateOnlyString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Convert a date string to a consistent format for storage */
export const normalizeDateForStorage = (dateInput: string | Date): string => {
  let date: Date;

  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (dateInput.includes("T")) {
    // It's already an ISO string
    date = new Date(dateInput);
  } else {
    // It's a date-only string like "2025-10-01"
    // Create a date object in local timezone to avoid UTC conversion issues
    const [year, month, day] = dateInput.split("-").map(Number);
    date = new Date(year, month - 1, day);
  }

  return dateToDateOnlyString(date);
};
