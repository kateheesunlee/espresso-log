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

export interface Bean {
  id: string;
  userId: string;
  name: string;
  origin?: string;
  process?: string;
  roastLevel?: RoastLevel;
  roastDate?: string;
  aromaTags?: string[]; // Allow custom tags beyond predefined AromaTag enum
  notes?: string;
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
    ratio: number;
    shotTime_s?: number;
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
  shotTime_s: string; // TextInput value
  ratio: string; // TextInput value
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
    | "shotTime_s"
    | "ratio"
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
  dose_g: number;
  yield_g: number;
  shotTime_s: number;
  ratio: number;
  grindSetting: number;
  waterTemp_C: number;
  preinfusion_s: number;
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
  shotTime_s: parseFloat(formData.shotTime_s),
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
  dose_g: shot.dose_g.toString(),
  yield_g: shot.yield_g.toString(),
  shotTime_s: shot.shotTime_s.toString(),
  ratio: shot.ratio.toString(),
  grindSetting: shot.grindSetting.toString(),
  waterTemp_C: shot.waterTemp_C.toString(),
  preinfusion_s: shot.preinfusion_s.toString(),
  rating: shot.rating,
  acidity: shot.acidity,
  bitterness: shot.bitterness,
  body: shot.body,
  aftertaste: shot.aftertaste,
  tastingTags: shot.tastingTags,
  notes: shot.notes,
  isFavorite: shot.isFavorite,
});
