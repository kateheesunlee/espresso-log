import { TASTE_BALANCE_QUALITY_INDICATORS_BY_LABEL } from '@types';

const EPS = 0.08; // near-zero cutoff
const BAND_THRESHOLDS = {
  slight: 0.25,
  moderate: 0.6,
  strong: 0.9,
  extreme: 1,
};

// Strength band definition
type Band = 'slight' | 'moderate' | 'strong' | 'extreme';

type Trio = [string, string, string];

const adverbByBand: Record<Band, string> = {
  slight: 'Slightly',
  moderate: 'Moderately',
  strong: 'Strongly',
  extreme: 'Extremely',
};

function bandOf(abs: number): Band | null {
  if (abs < EPS) return null;
  if (abs <= BAND_THRESHOLDS.slight) return 'slight';
  if (abs <= BAND_THRESHOLDS.moderate) return 'moderate';
  if (abs <= BAND_THRESHOLDS.strong) return 'strong';
  return 'extreme';
}

// Band-based adverb
function adverbByBandOf(abs: number): string | null {
  if (abs < EPS) return null;
  if (abs <= BAND_THRESHOLDS.slight) return adverbByBand.slight;
  if (abs <= BAND_THRESHOLDS.moderate) return adverbByBand.moderate;
  if (abs <= BAND_THRESHOLDS.strong) return adverbByBand.strong;
  return adverbByBand.extreme;
}

/**
 * value: -1..1
 * labels: [left, center, right]
 * center is "Sweet Spot" without an adverb
 * left and right are an adverb + lowercase adjective
 */
export function formatBalance(value: number, labels: [string, string, string]) {
  // Safety checks
  if (typeof value !== 'number' || isNaN(value)) {
    return labels[1] || 'Unknown'; // Return center label or fallback
  }
  if (!labels || labels.length !== 3) {
    return 'Unknown';
  }

  const [left, center, right] = labels;
  const abs = Math.abs(value);
  const b = bandOf(abs);
  if (!b) return center; // Sweet Spot
  const side = value > 0 ? right : left;
  return `${adverbByBand[b]} ${side.toLowerCase()}`;
}

export function formatTastingSummary({
  acidity,
  bitterness,
  body,
  aftertaste,
}: {
  acidity: number;
  bitterness: number;
  body: number;
  aftertaste: number;
}): string {
  // If all values are less than EPS, return "Balanced overall"
  const all = [acidity, bitterness, body, aftertaste];
  if (all.every(v => Math.abs(v) < EPS)) return 'Balanced overall';

  // Sort by absolute value (intensity level): bitterness → acidity → aftertaste → body
  const items = [
    {
      key: 'Bitterness',
      value: bitterness,
      labels: TASTE_BALANCE_QUALITY_INDICATORS_BY_LABEL.Bitterness as Trio,
    },
    {
      key: 'Acidity',
      value: acidity,
      labels: TASTE_BALANCE_QUALITY_INDICATORS_BY_LABEL.Acidity as Trio,
    },
    {
      key: 'Aftertaste',
      value: aftertaste,
      labels: TASTE_BALANCE_QUALITY_INDICATORS_BY_LABEL.Aftertaste as Trio,
    },
    {
      key: 'Body',
      value: body,
      labels: TASTE_BALANCE_QUALITY_INDICATORS_BY_LABEL.Body as Trio,
    },
  ];

  // Group by band and collect adjectives for each band
  const groups: Partial<Record<Band, string[]>> = {};

  for (const { value, labels } of items) {
    const abs = Math.abs(value);
    const b = bandOf(abs);
    if (!b) continue;
    const [left, _center, right] = labels;
    const adj = (value > 0 ? right : left).toLowerCase();
    (groups[b] ??= []).push(adj);
  }

  // Generate phrases in order of band severity (extreme → strong → moderate → slight)
  const order: Band[] = ['extreme', 'strong', 'moderate', 'slight'];
  const parts: string[] = [];

  for (const b of order) {
    const list = groups[b];
    if (!list || list.length === 0) continue;

    // Remove duplicates
    const uniq = Array.from(new Set(list));

    // Format the phrase
    const phrase =
      uniq.length > 0 ? `${adverbByBand[b]} ${uniq.join(', ')}` : '';

    if (phrase) parts.push(phrase);
  }

  // If no phrases are generated, return "Balanced overall"
  return parts.length ? parts.join(', ') : 'Balanced overall';
}
