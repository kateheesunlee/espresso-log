import { RoastLevel, Suggestion, ShotInput, CoachField } from "../types";
import { classifyExtraction } from "../extraction";
import {
  THRESHOLDS,
  ROAST_THRESHOLDS,
  DEFAULT_DELTAS,
  MAX_DELTAS,
} from "../constants";

// ---- Utility Functions ---------------------------------------

/** Clamp a value between min and max bounds */
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** Calculate brew ratio from dose and yield (e.g., 2.0 for 1:2) */
const toRatio = (dose: number, yield_g: number) => +(yield_g / dose).toFixed(2);

/** Get absolute magnitude of a taste value (0 to 1 scale) */
function magnitude(v?: number) {
  if (v === undefined || v === 0) return 0;
  return Math.abs(v);
}

/** Convert magnitude to confidence level using threshold bands */
function confFromMag(m: number): "low" | "med" | "high" {
  if (m >= THRESHOLDS.HIGH_CONFIDENCE_MAGNITUDE) return "high";
  if (m >= THRESHOLDS.MED_CONFIDENCE_MAGNITUDE) return "med";
  return "low";
}

/**
 * Create a suggestion object with consistent structure.
 * All suggestions are marked as "rule"-based (vs "ai"-based).
 */
function createSuggestion(
  field: CoachField,
  options: {
    delta?: number;
    target?: number;
    reason: string;
    priority: number; // lower number = more important
    confidence: "low" | "med" | "high";
  }
): Suggestion {
  return {
    field,
    delta: options.delta,
    target: options.target,
    reason: options.reason,
    priority: options.priority,
    confidence: options.confidence,
    source: "rule",
  };
}

/**
 * Get the taste imbalance threshold for a specific roast level.
 * Light roasts are more sensitive (0.4), dark roasts more tolerant (0.6).
 */
function getImbalanceThreshold(roast: RoastLevel): number {
  return ROAST_THRESHOLDS[roast].imbalanceThreshold;
}

// ---- Taste Dimension Rule Functions -------------------------

/**
 * Generate suggestions for bitterness imbalance.
 * High bitterness indicates over-extraction (suggest coarser grind, higher ratio).
 * Low bitterness indicates under-extraction (suggest finer grind, longer time).
 */
function generateBitternessSuggestions(
  bitternessValue: number,
  threshold: number,
  ratio: number,
  waterTemp_C: number | undefined,
  deltas: typeof DEFAULT_DELTAS
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (bitternessValue > threshold) {
    // High bitterness - over extraction territory
    suggestions.push(
      createSuggestion("grindStep", {
        delta: +deltas.grindStep,
        reason: "Bitterness high → coarser grind",
        priority: 1,
        confidence: confFromMag(magnitude(bitternessValue)),
      })
    );
    suggestions.push(
      createSuggestion("ratio", {
        target: +(ratio + deltas.ratio).toFixed(1),
        reason: "Open up the shot (higher ratio)",
        priority: 2,
        confidence: "med",
      })
    );
    suggestions.push(
      createSuggestion("shotTime_s", {
        delta: -deltas.shotTime_s,
        reason: "Slightly shorten extraction",
        priority: 3,
        confidence: "low",
      })
    );
    if (waterTemp_C !== undefined) {
      suggestions.push(
        createSuggestion("waterTemp_C", {
          delta: -deltas.waterTemp_C,
          reason: "Lower temp to reduce harshness",
          priority: 4,
          confidence: "low",
        })
      );
    }
  } else if (bitternessValue < -threshold) {
    // Low bitterness - under extraction territory
    suggestions.push(
      createSuggestion("grindStep", {
        delta: -deltas.grindStep,
        reason: "Bitterness low/flat → finer grind",
        priority: 1,
        confidence: confFromMag(magnitude(bitternessValue)),
      })
    );
    suggestions.push(
      createSuggestion("ratio", {
        target: +(ratio - 0.1).toFixed(1),
        reason: "Slightly lower ratio for intensity",
        priority: 3,
        confidence: "low",
      })
    );
    suggestions.push(
      createSuggestion("shotTime_s", {
        delta: +deltas.shotTime_s,
        reason: "Slightly longer extraction",
        priority: 4,
        confidence: "low",
      })
    );
    if (waterTemp_C !== undefined) {
      suggestions.push(
        createSuggestion("waterTemp_C", {
          delta: +deltas.waterTemp_C,
          reason: "Raise temp to enhance development",
          priority: 5,
          confidence: "low",
        })
      );
    }
  }

  return suggestions;
}

/**
 * Generate suggestions for acidity imbalance.
 * High acidity (sour) indicates under-extraction (suggest coarser grind).
 * Low acidity (flat) indicates over-extraction or dull coffee (suggest finer grind, higher temp).
 */
function generateAciditySuggestions(
  acidityValue: number,
  threshold: number,
  ratio: number,
  waterTemp_C: number | undefined,
  deltas: typeof DEFAULT_DELTAS
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (acidityValue > threshold) {
    // High acidity - too sour/bright
    suggestions.push(
      createSuggestion("grindStep", {
        delta: +deltas.grindStep,
        reason: "Acidity high → coarser grind",
        priority: 1,
        confidence: confFromMag(magnitude(acidityValue)),
      })
    );
    suggestions.push(
      createSuggestion("ratio", {
        target: +(ratio + deltas.ratio).toFixed(1),
        reason: "Higher ratio to smooth sharpness",
        priority: 2,
        confidence: "med",
      })
    );
    if (waterTemp_C !== undefined) {
      suggestions.push(
        createSuggestion("waterTemp_C", {
          delta: -deltas.waterTemp_C,
          reason: "Lower temp slightly",
          priority: 4,
          confidence: "low",
        })
      );
    }
  } else if (acidityValue < -threshold) {
    // Low acidity - flat/dull
    suggestions.push(
      createSuggestion("grindStep", {
        delta: -deltas.grindStep,
        reason: "Acidity low → finer grind",
        priority: 1,
        confidence: confFromMag(magnitude(acidityValue)),
      })
    );
    if (waterTemp_C !== undefined) {
      suggestions.push(
        createSuggestion("waterTemp_C", {
          delta: +deltas.waterTemp_C,
          reason: "Raise temp to boost brightness",
          priority: 2,
          confidence: "med",
        })
      );
    }
    suggestions.push(
      createSuggestion("dose_g", {
        delta: +deltas.dose_g,
        reason: "A touch more dose for structure",
        priority: 3,
        confidence: "low",
      })
    );
    suggestions.push(
      createSuggestion("shotTime_s", {
        delta: +deltas.shotTime_s,
        reason: "Slightly longer time to develop acids",
        priority: 4,
        confidence: "low",
      })
    );
  }

  return suggestions;
}

/**
 * Generate suggestions for body imbalance.
 * Low body (thin/watery) → increase dose, finer grind, lower ratio.
 * Heavy body (too thick) → higher ratio, coarser grind, reduce dose.
 */
function generateBodySuggestions(
  bodyValue: number,
  threshold: number,
  ratio: number,
  deltas: typeof DEFAULT_DELTAS
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (bodyValue < -threshold) {
    // Low body - thin/watery
    suggestions.push(
      createSuggestion("dose_g", {
        delta: +deltas.dose_g,
        reason: "Body low → increase dose slightly",
        priority: 1,
        confidence: confFromMag(magnitude(bodyValue)),
      })
    );
    suggestions.push(
      createSuggestion("grindStep", {
        delta: -deltas.grindStep,
        reason: "Finer grind to build texture",
        priority: 2,
        confidence: "med",
      })
    );
    suggestions.push(
      createSuggestion("ratio", {
        target: +(ratio - 0.1).toFixed(1),
        reason: "Lower ratio for weight",
        priority: 3,
        confidence: "low",
      })
    );
  } else if (bodyValue > threshold) {
    // Heavy body - too thick/syrupy
    suggestions.push(
      createSuggestion("ratio", {
        target: +(ratio + 0.2).toFixed(1),
        reason: "Body heavy → open ratio",
        priority: 1,
        confidence: "med",
      })
    );
    suggestions.push(
      createSuggestion("grindStep", {
        delta: +deltas.grindStep,
        reason: "Coarser for lighter texture",
        priority: 2,
        confidence: "med",
      })
    );
    suggestions.push(
      createSuggestion("dose_g", {
        delta: -0.2,
        reason: "Slightly reduce dose",
        priority: 3,
        confidence: "low",
      })
    );
  }

  return suggestions;
}

/**
 * Generate suggestions for aftertaste imbalance.
 * Harsh finish indicates over-extraction (suggest coarser grind, higher ratio).
 * Short/disappearing finish indicates incomplete extraction (suggest finer grind, longer time).
 */
function generateAftertasteSuggestions(
  aftertasteValue: number,
  threshold: number,
  ratio: number,
  waterTemp_C: number | undefined,
  deltas: typeof DEFAULT_DELTAS
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (aftertasteValue > threshold) {
    // Harsh/unpleasant finish
    suggestions.push(
      createSuggestion("grindStep", {
        delta: +deltas.grindStep,
        reason: "Harsh finish → go coarser",
        priority: 1,
        confidence: confFromMag(magnitude(aftertasteValue)),
      })
    );
    suggestions.push(
      createSuggestion("ratio", {
        target: +(ratio + 0.2).toFixed(1),
        reason: "Higher ratio to clean finish",
        priority: 2,
        confidence: "med",
      })
    );
    if (waterTemp_C !== undefined) {
      suggestions.push(
        createSuggestion("waterTemp_C", {
          delta: -deltas.waterTemp_C,
          reason: "Lower temp slightly",
          priority: 3,
          confidence: "low",
        })
      );
    }
  } else if (aftertasteValue < -threshold) {
    // Short/disappearing finish
    suggestions.push(
      createSuggestion("grindStep", {
        delta: -deltas.grindStep,
        reason: "Finish too short → finer",
        priority: 2,
        confidence: "low",
      })
    );
    suggestions.push(
      createSuggestion("shotTime_s", {
        delta: +deltas.shotTime_s,
        reason: "Longer extraction for lingering sweetness",
        priority: 3,
        confidence: "low",
      })
    );
  }

  return suggestions;
}

/**
 * Apply roast-specific bias to suggestions.
 * Light roasts benefit from higher temps and finer grinds.
 * Dark roasts benefit from lower temps and coarser grinds.
 * Adjusts priority (lower = more important) and delta magnitude.
 */
function applyRoastBias(roast: RoastLevel, s: Suggestion): Suggestion {
  const out = { ...s };

  if (roast === "Light") {
    // Light roasts: sensitive to temperature
    if (s.field === "waterTemp_C" && s.delta && s.delta < 0) {
      out.priority += 2; // De-prioritize lowering temp (light needs heat)
    }
    if (s.field === "waterTemp_C" && s.delta && s.delta > 0) {
      out.priority -= 1; // Boost raising temp (helps extraction)
    }
    if (s.field === "grindStep" && s.delta && s.delta < 0) {
      out.priority -= 1; // Boost finer grind (light roasts need extraction)
    }
    if (s.field === "preinfusion_s" && s.delta && s.delta > 0) {
      out.priority -= 1; // Boost preinfusion (helps even extraction)
    }
  }

  if (roast === "Dark" || roast === "Medium Dark") {
    // Dark roasts: prone to bitterness, benefit from lower temp
    if (s.field === "waterTemp_C" && s.delta && s.delta < 0) {
      out.priority -= 1; // Boost lowering temp (reduces harshness)
      out.delta = s.delta * 1.5; // Amplify temp decrease (rounded later)
    }
    if (s.field === "grindStep" && s.delta && s.delta > 0) {
      out.priority -= 1; // Boost coarser grind (prevents over-extraction)
    }
    if (s.field === "shotTime_s" && s.delta && s.delta < 0) {
      out.priority -= 1; // Boost shorter time (reduces bitterness)
    }
  }

  return out;
}

// ---- Core Rules ---------------------------------------------

/**
 * Generates coaching suggestions based on shot taste profile and parameters.
 *
 * @param input - Shot parameters and taste balance
 * @returns Array of up to 3 prioritized suggestions (lower priority number = more important)
 *
 * Priority scale:
 * - 1-2: Critical adjustments (primary drivers of taste)
 * - 3-4: Secondary adjustments (fine-tuning)
 * - 5-6: Tertiary adjustments (minor improvements)
 */
export function ruleCoachShot(input: ShotInput): Suggestion[] {
  const { roast, dose_g, yield_g, shotTime_s, waterTemp_C, balance } = input;
  const ratio = input.ratio ?? toRatio(dose_g, yield_g);

  // Accumulate suggestions from all taste dimensions
  const S: Suggestion[] = [];
  const push = (s: Suggestion) => S.push(applyRoastBias(roast, s));

  // Get roast-specific threshold (light: 0.4, dark: 0.6)
  const threshold = getImbalanceThreshold(roast);

  // Generate suggestions for each taste dimension
  const bitternessSuggestions = generateBitternessSuggestions(
    balance.bitterness ?? 0,
    threshold,
    ratio,
    waterTemp_C,
    DEFAULT_DELTAS
  );
  bitternessSuggestions.forEach(push);

  const aciditySuggestions = generateAciditySuggestions(
    balance.acidity ?? 0,
    threshold,
    ratio,
    waterTemp_C,
    DEFAULT_DELTAS
  );
  aciditySuggestions.forEach(push);

  const bodySuggestions = generateBodySuggestions(
    balance.body ?? 0,
    threshold,
    ratio,
    DEFAULT_DELTAS
  );
  bodySuggestions.forEach(push);

  const aftertasteSuggestions = generateAftertasteSuggestions(
    balance.aftertaste ?? 0,
    threshold,
    ratio,
    waterTemp_C,
    DEFAULT_DELTAS
  );
  aftertasteSuggestions.forEach(push);

  // Classify overall extraction state (under/balanced/over)
  // This provides directional weighting for final suggestion ranking
  const extraction = classifyExtraction(
    {
      acidity: balance.acidity,
      bitterness: balance.bitterness,
      body: balance.body,
      aftertaste: balance.aftertaste,
      shotTime_s,
      ratio,
    },
    roast
  );

  /**
   * Create a weighting function based on extraction state.
   * Reduces priority number (= increases importance) for suggestions that align
   * with the extraction direction (under/over).
   *
   * For under-extraction: boost finer grind, longer time, higher temp, lower ratio
   * For over-extraction: boost coarser grind, shorter time, lower temp, higher ratio
   *
   * Also applies confidence boost and slight ratio influence increase.
   */
  function weightForFactory(
    ratio: number,
    extraction: ReturnType<typeof classifyExtraction>
  ) {
    return (s: Suggestion) => {
      const dir = extraction.label.startsWith("under")
        ? "under"
        : extraction.label.startsWith("over")
        ? "over"
        : "balanced";

      let w = 0;
      const sign = (v?: number) => ((v ?? 0) === 0 ? 0 : v! > 0 ? +1 : -1);

      if (dir === "under") {
        // Under-extraction: prioritize these adjustments
        if (s.field === "grindStep" && sign(s.delta) === -1) w -= 2; // Finer grind
        if (s.field === "shotTime_s" && sign(s.delta) === +1) w -= 1.5; // Longer time
        if (s.field === "waterTemp_C" && sign(s.delta) === +1) w -= 1; // Higher temp
        if (s.field === "ratio" && (s.target ?? ratio) < ratio) w -= 1.2; // Lower ratio
        if (s.field === "dose_g" && sign(s.delta) === +1) w -= 0.5; // More dose
      } else if (dir === "over") {
        // Over-extraction: prioritize these adjustments
        if (s.field === "grindStep" && sign(s.delta) === +1) w -= 2; // Coarser grind
        if (s.field === "shotTime_s" && sign(s.delta) === -1) w -= 1.5; // Shorter time
        if (s.field === "waterTemp_C" && sign(s.delta) === -1) w -= 1; // Lower temp
        if (s.field === "ratio" && (s.target ?? ratio) > ratio) w -= 1.2; // Higher ratio
        if (s.field === "dose_g" && sign(s.delta) === -1) w -= 0.5; // Less dose
      }

      // Apply confidence multiplier (high confidence gets 1.2x weight boost)
      if (extraction.confidence === "high") w *= 1.2;

      // Slightly increase ratio influence to reduce conflicts with grind
      if (s.field === "ratio") w *= 1.15;

      return w;
    };
  }

  // ---- Deduplication & Conflict Resolution ----
  // When multiple suggestions target the same field, keep only the highest priority one.
  // Prefer 'target' suggestions over 'delta' suggestions (target is more specific).
  const byField = new Map<CoachField, Suggestion>();
  for (const s of S.sort((a, b) => a.priority - b.priority)) {
    const prev = byField.get(s.field);
    if (!prev) {
      byField.set(s.field, s);
    } else {
      // Score: target suggestions (more specific) > delta suggestions
      const score = (x: Suggestion) => (x.target !== undefined ? 2 : 1);
      if (score(s) > score(prev)) byField.set(s.field, s);
    }
  }

  // ---- Normalization & Clamping ----
  // Round and clamp all deltas/targets to safe ranges.
  // Filter out zero-delta suggestions (no actual change).
  const normalized = Array.from(byField.values())
    .map((out) => {
      const s = { ...out };
      if (s.field === "waterTemp_C" && s.delta !== undefined) {
        s.delta = clamp(
          Math.round(s.delta),
          -MAX_DELTAS.waterTemp_C,
          +MAX_DELTAS.waterTemp_C
        );
        if (s.delta === 0) return null;
      }
      if (s.field === "shotTime_s" && s.delta !== undefined) {
        s.delta = clamp(
          Math.round(s.delta),
          -MAX_DELTAS.shotTime_s,
          +MAX_DELTAS.shotTime_s
        );
        if (s.delta === 0) return null;
      }
      if (s.field === "grindStep" && s.delta !== undefined) {
        s.delta = clamp(
          Math.round(s.delta),
          -MAX_DELTAS.grindStep,
          +MAX_DELTAS.grindStep
        );
        if (s.delta === 0) return null;
      }
      if (s.field === "dose_g" && s.delta !== undefined) {
        const rounded = Math.round(s.delta * 10) / 10; // 0.1g precision
        s.delta = clamp(rounded, -MAX_DELTAS.dose_g, +MAX_DELTAS.dose_g);
        if (s.delta === 0) return null;
      }
      if (s.field === "ratio" && s.target !== undefined) {
        s.target = clamp(
          +s.target.toFixed(1),
          MAX_DELTAS.ratio.min,
          MAX_DELTAS.ratio.max
        );
      }
      return s;
    })
    .filter(Boolean) as Suggestion[];

  // ---- Final Ranking ----
  // Sort by: priority (base importance) + extraction-based weight
  // Lower combined score = higher importance
  const weightFor = weightForFactory(ratio, extraction);
  normalized.sort(
    (a, b) => a.priority + weightFor(a) - (b.priority + weightFor(b))
  );

  // Return top 3 suggestions for UI display
  return normalized.slice(0, 3);
}
