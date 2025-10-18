import {
  RoastLevel,
  ExtractionClass,
  ShotFormData,
  ExtractionSummary,
} from "@types";
import { EXTRACTION_BANDS, DEAD_BAND } from "./constants";

/** keep values safely in [-1, +1] */
const clamp = (x: number) => Math.max(-1, Math.min(1, x));

/** roast-based target ratio/time (heuristic) */
function targetByRoast(roast: RoastLevel) {
  if (roast === "Light" || roast === "Medium Light") {
    return { ratio: 2.2, timeS: 32, bias: -0.05 }; // slightly tolerant to brightness
  }
  if (roast === "Dark" || roast === "Medium Dark") {
    return { ratio: 1.8, timeS: 28, bias: +0.05 }; // slightly tolerant to bitterness
  }
  return { ratio: 2.0, timeS: 30, bias: 0 };
}

/**
 * Classify extraction using sensory axis (bitterness - acidity) as primary,
 * with small adjustments from brew variables (time/ratio/temp/bean age).
 * All tasting inputs are already in [-1, +1].
 */
export function classifyExtraction(
  shot: ShotFormData,
  roast: RoastLevel
): ExtractionSummary {
  const {
    acidity = 0, // -1 = flat/sour-, 0 = sweet spot, +1 = sharp
    bitterness = 0, // -1 = none, 0 = sweet spot, +1 = bitter/harsh
    body = 0, // -1 = watery, 0 = sweet spot, +1 = heavy
    aftertaste = 0, // -1 = faint, 0 = sweet spot, +1 = harsh/lingering
    ratio,
    shotTime_s, // optional
    waterTemp_C, // optional
    beanAgeDays, // optional (opening/roast age → days)
  } = shot as any;

  // 1) sensory (primary signal): bitterness - acidity, small body/after corrections
  const A = clamp(acidity);
  const B = clamp(bitterness);
  const BD = clamp(body);
  const AF = clamp(aftertaste);

  const sensory =
    0.65 * (B - A) + // main under/over axis
    0.12 * BD +
    0.08 * AF;

  // 2) brew variables as deviations around roast-dependent targets
  const t = targetByRoast(roast);

  // normalize deviations to roughly [-1, +1] bands
  const timeDev =
    typeof shotTime_s === "number" ? clamp((shotTime_s - t.timeS) / 8) : 0; // ±8s → ±1
  const ratioDev =
    typeof ratio === "number" ? clamp((ratio - t.ratio) / 0.6) : 0; // ±0.6 → ±1
  const tempDev =
    typeof waterTemp_C === "number" ? clamp((waterTemp_C - 94) / 6) : 0; // 94±6°C → ±1

  // bean age: very fresh → under-ish, very old → over-ish
  const beanAgeDev =
    typeof beanAgeDays === "number"
      ? beanAgeDays < 5
        ? -0.5
        : beanAgeDays > 28
        ? +0.5
        : 0
      : 0;

  const brew =
    0.22 * timeDev + 0.18 * ratioDev + 0.08 * tempDev + 0.08 * beanAgeDev;

  // roast bias (small constant shift)
  const roastBias = t.bias;

  // 3) final score in [-1, +1]: negative=under, positive=over
  let score = sensory + brew + roastBias;
  score = +clamp(score).toFixed(2);

  // 4) map to label with deadband
  const b = EXTRACTION_BANDS;
  let label: ExtractionClass;
  if (score <= b.under + DEAD_BAND) label = "under";
  else if (score <= b.slightlyUnder + DEAD_BAND) label = "slightly-under";
  else if (score < b.slightlyOver - DEAD_BAND) label = "balanced";
  else if (score < b.over - DEAD_BAND) label = "slightly-over";
  else label = "over";

  // 5) confidence from sensory magnitude + process deviations
  const primaryMag = Math.max(Math.abs(A), Math.abs(B));
  const auxMag = 0.2 * Math.abs(AF) + 0.1 * Math.abs(BD);
  const processMag = 0.15 * Math.abs(timeDev) + 0.1 * Math.abs(ratioDev);
  const mag = 0.7 * primaryMag + auxMag + processMag;

  const confidence: "low" | "med" | "high" =
    mag >= 0.75 ? "high" : mag >= 0.4 ? "med" : "low";

  const reason =
    label === "under"
      ? "Bright/sour dominates; likely under-extracted."
      : label === "slightly-under"
      ? "Slightly bright with lighter bitterness."
      : label === "slightly-over"
      ? "Slightly bitter/heavy; tending to over."
      : label === "over"
      ? "Harsh/bitter dominates; likely over-extracted."
      : "Near the sweet spot (balanced acidity & bitterness).";

  return { score, label, confidence, reason };
}
