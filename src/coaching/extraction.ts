import { RoastLevel } from "@types";
import { ExtractionClass } from "./types";
import { EXTRACTION_BANDS, DEAD_BAND } from "./constants";

export interface ExtractionInfo {
  score: number;
  label: ExtractionClass;
  confidence: "low" | "med" | "high";
  reason: string;
}

export function classifyExtraction(
  params: {
    acidity?: number;
    bitterness?: number;
    body?: number;
    aftertaste?: number;
    shotTime_s?: number;
    ratio?: number; // unified name
  },
  roast: RoastLevel
): ExtractionInfo {
  const {
    acidity = 0,
    bitterness = 0,
    body = 0,
    aftertaste = 0,
    shotTime_s,
    ratio,
  } = params as any;

  // Default weights (preserve your intent)
  let wAcidity = 0.55; // +acidity → under
  let wBitterness = 0.65; // +bitterness → over
  let wBody = 0.15; // small correction
  let wAfter = 0.2; // small correction

  if (roast === "Light" || roast === "Medium Light") wAcidity += 0.05;
  if (roast === "Dark" || roast === "Medium Dark") wBitterness += 0.05;

  // Core score: + = over, - = under
  let score = wBitterness * bitterness + wAcidity * -acidity;
  score += wBody * body;
  score += wAfter * aftertaste;

  // Soft guards
  if (typeof shotTime_s === "number") {
    if (shotTime_s < 25) score -= 0.15;
    else if (shotTime_s > 35) score += 0.15;
  }

  if (typeof ratio === "number") {
    const ratioOffset = ratio - 2.0;
    score += ratioOffset * 0.15;
  }

  score = Math.max(-1, Math.min(1, +score.toFixed(2)));

  // Deadbanded label selection
  const b = EXTRACTION_BANDS;
  let label: ExtractionClass;
  if (score <= b.under + DEAD_BAND) label = "under";
  else if (score <= b.slightlyUnder + DEAD_BAND) label = "slightly-under";
  else if (score < b.slightlyOver - DEAD_BAND) label = "balanced";
  else if (score < b.over - DEAD_BAND) label = "slightly-over";
  else label = "over";

  // Improved confidence (primary + auxiliaries + ratio deviation)
  const primary = Math.max(Math.abs(acidity), Math.abs(bitterness));
  const aux = 0.2 * Math.abs(aftertaste) + 0.1 * Math.abs(body || 0);
  const ratioDev =
    typeof ratio === "number" ? Math.min(1, Math.abs(ratio - 2.0) / 0.6) : 0;
  const mag = 0.7 * primary + aux + 0.1 * ratioDev;

  const confidence: "low" | "med" | "high" =
    mag >= 0.75 ? "high" : mag >= 0.4 ? "med" : "low";

  const reason =
    label === "under"
      ? "Bright/sour signals dominate (under-extracted)."
      : label === "slightly-under"
      ? "Slightly bright with lighter bitterness."
      : label === "slightly-over"
      ? "Slightly bitter/heavy profile."
      : label === "over"
      ? "Harsh/bitter signals dominate (over-extracted)."
      : "Sweet spot around balanced acidity and bitterness.";

  return { score, label, confidence, reason };
}
