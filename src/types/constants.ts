import { TasteBalanceLabel } from "./enums";

// Taste balance quality indicators
export const TASTE_BALANCE_QUALITY_INDICATORS_BY_LABEL: Record<
  TasteBalanceLabel,
  string[]
> = {
  Acidity: ["Flat", "Sweet Spot", "Sharp"],
  Bitterness: ["Flat", "Sweet Spot", "Bitter"],
  Body: ["Watery", "Sweet Spot", "Heavy"],
  Aftertaste: ["Faint", "Sweet Spot", "Harsh"],
} as const;

// Database-specific constants
export const STORAGE_KEY = "espresso_log_data";
