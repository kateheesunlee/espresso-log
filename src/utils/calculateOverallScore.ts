/**
 * Calculate overall espresso shot quality (0–10)
 * using tasting balance values in [-1..1].
 * 0 = sweet spot, ±1 = extreme deviation
 */

export function calculateOverallScore(
  acidity: number, // -1..1
  bitterness: number, // -1..1
  body: number, // -1..1
  aftertaste: number, // -1..1
  opts?: {
    weights?: {
      acidity: number;
      bitterness: number;
      body: number;
      aftertaste: number;
    };
    exponent?: number; // controls nonlinearity (default 2 → RMS)
  }
): number {
  const clamp = (x: number) => Math.max(-1, Math.min(1, x));
  const A = clamp(acidity);
  const B = clamp(bitterness);
  const BD = clamp(body);
  const AF = clamp(aftertaste);

  // Basic weights (based on espresso perception)
  // Bitterness/aftertaste weight slightly higher, body weight lower
  const W = {
    acidity: 0.3,
    bitterness: 0.35,
    body: 0.15,
    aftertaste: 0.2,
    ...(opts?.weights ?? {}),
  };

  // Apply nonlinearity (RMS or exponent)
  const p = opts?.exponent ?? 2; // exponent=2 → RMS

  const devA = Math.pow(Math.abs(A), p);
  const devB = Math.pow(Math.abs(B), p);
  const devBD = Math.pow(Math.abs(BD), p);
  const devAF = Math.pow(Math.abs(AF), p);

  // weighted mean of deviations
  const weighted =
    W.acidity * devA +
    W.bitterness * devB +
    W.body * devBD +
    W.aftertaste * devAF;

  const weightSum = W.acidity + W.bitterness + W.body + W.aftertaste;
  const severity = Math.pow(weighted / weightSum, 1 / p); // RMS 역변환

  // Map severity to score: 0 = 10 points, 1 = 0 points
  const score = 10 * (1 - severity);
  return Math.round(score * 10) / 10;
}
