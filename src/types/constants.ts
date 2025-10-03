import { TasteBalanceLabel } from "./enums";

// Taste balance quality indicators
export const TASTE_BALANCE_QUALITY_INDICATORS_BY_LABEL: Record<
  TasteBalanceLabel,
  string[]
> = {
  Acidity: ["Flat", "Balanced", "Sharp"],
  Bitterness: ["Flat", "Balanced", "Bitter"],
  Body: ["Watery", "Balanced", "Heavy"],
  Aftertaste: ["Faint", "Balanced", "Harsh"],
} as const;

// Database-specific constants
export const STORAGE_KEY = "espresso_log_data";
