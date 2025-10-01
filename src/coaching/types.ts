import { RoastLevel as RoastLevelEnum } from "../database/UniversalDatabase";

export type RoastLevel = RoastLevelEnum;

export type BalanceVal = -1 | -0.5 | 0 | 0.5 | 1;

export interface TasteBalance {
  acidity?: number;
  bitterness?: number;
  body?: number;
  aftertaste?: number;
}

export interface ShotInput {
  roast: RoastLevel;
  dose_g: number;
  yield_g: number;
  shotTime_s: number;
  ratio?: number;
  waterTemp_C?: number;
  preinfusion_s?: number;
  grindStep?: number;
  balance: TasteBalance;
}

export type CoachField =
  | "grindStep"
  | "dose_g"
  | "ratio"
  | "shotTime_s"
  | "waterTemp_C"
  | "preinfusion_s";

export interface Suggestion {
  field: CoachField;
  delta?: number;
  target?: number;
  reason: string;
  priority: number;
  confidence: "low" | "med" | "high";
  source: "rule" | "ai";
}

export type ExtractionClass =
  | "under"
  | "slightly-under"
  | "balanced"
  | "slightly-over"
  | "over";

export interface ExtractionSummary {
  score: number; // -1..1
  label: ExtractionClass;
  confidence: "low" | "med" | "high";
  reason: string;
}
