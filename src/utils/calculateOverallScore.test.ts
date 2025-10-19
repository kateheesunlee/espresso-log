import { calculateOverallScore } from './calculateOverallScore';

describe('calculateOverallScore', () => {
  describe('basic functionality', () => {
    it('should return 10 for perfect balance (all 0)', () => {
      const score = calculateOverallScore(0, 0, 0, 0);
      expect(score).toBe(10);
    });

    it('should return 0 for extreme deviations (all ±1)', () => {
      const score = calculateOverallScore(1, 1, 1, 1);
      expect(score).toBe(0);
    });

    it('should return 0 for extreme negative deviations (all -1)', () => {
      const score = calculateOverallScore(-1, -1, -1, -1);
      expect(score).toBe(0);
    });

    it('should return mixed scores for mixed deviations', () => {
      const score = calculateOverallScore(0.5, 0, -0.5, 0);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(10);
    });
  });

  describe('input clamping', () => {
    it('should clamp values outside [-1, 1] range', () => {
      const score1 = calculateOverallScore(2, 0, 0, 0);
      const score2 = calculateOverallScore(1, 0, 0, 0);
      expect(score1).toBe(score2);
    });

    it('should clamp negative values outside [-1, 1] range', () => {
      const score1 = calculateOverallScore(-2, 0, 0, 0);
      const score2 = calculateOverallScore(-1, 0, 0, 0);
      expect(score1).toBe(score2);
    });

    it('should handle multiple out-of-range values', () => {
      const score = calculateOverallScore(2, -2, 1.5, -1.5);
      expect(score).toBe(0); // All should be clamped to ±1, resulting in 0 score
    });
  });

  describe('custom weights', () => {
    it('should use custom weights when provided', () => {
      const defaultScore = calculateOverallScore(0.5, 0, 0, 0);
      const customScore = calculateOverallScore(0.5, 0, 0, 0, {
        weights: {
          acidity: 0.8,
          bitterness: 0.1,
          body: 0.05,
          aftertaste: 0.05,
        },
      });

      // With higher acidity weight, the score should be lower
      expect(customScore).toBeLessThan(defaultScore);
    });

    it('should normalize custom weights', () => {
      const score1 = calculateOverallScore(0.5, 0, 0, 0, {
        weights: {
          acidity: 0.4,
          bitterness: 0.4,
          body: 0.2,
          aftertaste: 0.2,
        },
      });

      const score2 = calculateOverallScore(0.5, 0, 0, 0, {
        weights: {
          acidity: 0.8,
          bitterness: 0.8,
          body: 0.4,
          aftertaste: 0.4,
        },
      });

      // Should produce the same score since weights are normalized
      expect(score1).toBe(score2);
    });
  });

  describe('custom exponent', () => {
    it('should use custom exponent for nonlinearity', () => {
      const score1 = calculateOverallScore(0.5, 0.5, 0.5, 0.5, { exponent: 1 });
      const score2 = calculateOverallScore(0.5, 0.5, 0.5, 0.5, { exponent: 2 });
      const score3 = calculateOverallScore(0.5, 0.5, 0.5, 0.5, { exponent: 3 });

      // Higher exponent should result in lower scores for the same deviations
      expect(score1).toBeGreaterThanOrEqual(score2);
      expect(score2).toBeGreaterThanOrEqual(score3);
    });

    it('should default to exponent 2 (RMS)', () => {
      const defaultScore = calculateOverallScore(0.5, 0.5, 0.5, 0.5);
      const explicitScore = calculateOverallScore(0.5, 0.5, 0.5, 0.5, {
        exponent: 2,
      });
      expect(defaultScore).toBe(explicitScore);
    });
  });

  describe('edge cases', () => {
    it('should handle very small deviations', () => {
      const score = calculateOverallScore(0.001, 0.001, 0.001, 0.001);
      expect(score).toBeCloseTo(10, 1);
    });

    it('should handle zero exponent gracefully', () => {
      const score = calculateOverallScore(0.5, 0.5, 0.5, 0.5, { exponent: 0 });
      // Zero exponent causes division by zero, so we expect NaN or a handled case
      expect(isNaN(score)).toBe(true);
    });

    it('should handle very large exponent', () => {
      const score = calculateOverallScore(0.1, 0.1, 0.1, 0.1, { exponent: 10 });
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(10);
    });
  });

  describe('scoring precision', () => {
    it('should round to one decimal place', () => {
      const score = calculateOverallScore(0.333, 0.333, 0.333, 0.333);
      expect(score).toBe(Math.round(score * 10) / 10);
    });

    it('should handle decimal precision correctly', () => {
      const score = calculateOverallScore(
        0.123456,
        0.123456,
        0.123456,
        0.123456
      );
      expect(score.toString()).toMatch(/^\d+\.\d$/);
    });
  });

  describe('real-world scenarios', () => {
    it('should score a balanced shot appropriately', () => {
      // Slightly off balance but not extreme
      const score = calculateOverallScore(0.2, -0.1, 0.1, -0.2);
      expect(score).toBeGreaterThan(5);
      expect(score).toBeLessThan(10);
    });

    it('should score an unbalanced shot appropriately', () => {
      // More significant deviations
      const score = calculateOverallScore(0.7, -0.6, 0.5, -0.8);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(5);
    });

    it('should score a terrible shot appropriately', () => {
      // Very extreme deviations
      const score = calculateOverallScore(1, -1, 1, -1);
      expect(score).toBe(0);
    });
  });

  describe('weight distribution impact', () => {
    it('should reflect different weight priorities', () => {
      // Test with high acidity weight
      const highAcidityScore = calculateOverallScore(0.5, 0, 0, 0, {
        weights: { acidity: 1.0, bitterness: 0, body: 0, aftertaste: 0 },
      });

      // Test with high bitterness weight
      const highBitternessScore = calculateOverallScore(0, 0.5, 0, 0, {
        weights: { acidity: 0, bitterness: 1.0, body: 0, aftertaste: 0 },
      });

      // Both should have the same score since they have the same deviation magnitude
      expect(highAcidityScore).toBe(highBitternessScore);
    });

    it('should prioritize weighted attributes', () => {
      // Same deviation in different attributes with different weights
      const acidityHeavy = calculateOverallScore(0.5, 0, 0, 0, {
        weights: {
          acidity: 0.8,
          bitterness: 0.1,
          body: 0.05,
          aftertaste: 0.05,
        },
      });

      const bitternessHeavy = calculateOverallScore(0, 0.5, 0, 0, {
        weights: {
          acidity: 0.1,
          bitterness: 0.8,
          body: 0.05,
          aftertaste: 0.05,
        },
      });

      // Both should have similar scores since they have the same weighted impact
      expect(Math.abs(acidityHeavy - bitternessHeavy)).toBeLessThan(1);
    });
  });
});
