import { formatBalance, formatTastingSummary } from "./formatTastingSummary";

describe("formatTastingSummary", () => {
  describe("formatBalance", () => {
    const acidityLabels: [string, string, string] = [
      "Flat",
      "Sweet Spot",
      "Sharp",
    ];
    const bitternessLabels: [string, string, string] = [
      "Flat",
      "Sweet Spot",
      "Bitter",
    ];
    const bodyLabels: [string, string, string] = [
      "Watery",
      "Sweet Spot",
      "Heavy",
    ];
    const aftertasteLabels: [string, string, string] = [
      "Faint",
      "Sweet Spot",
      "Harsh",
    ];

    it("should return Sweet Spot for values near zero", () => {
      expect(formatBalance(0, acidityLabels)).toBe("Sweet Spot");
      expect(formatBalance(0.001, acidityLabels)).toBe("Sweet Spot");
      expect(formatBalance(-0.001, acidityLabels)).toBe("Sweet Spot");
      expect(formatBalance(0.07, acidityLabels)).toBe("Sweet Spot"); // Just under EPS (0.08)
    });

    it("should return appropriate slight deviations", () => {
      expect(formatBalance(0.1, acidityLabels)).toBe("Slightly sharp");
      expect(formatBalance(-0.1, acidityLabels)).toBe("Slightly flat");
      expect(formatBalance(0.2, bitternessLabels)).toBe("Slightly bitter");
      expect(formatBalance(-0.2, bitternessLabels)).toBe("Slightly flat");
    });

    it("should return appropriate moderate deviations", () => {
      expect(formatBalance(0.3, acidityLabels)).toBe("Moderately sharp");
      expect(formatBalance(-0.3, acidityLabels)).toBe("Moderately flat");
      expect(formatBalance(0.5, bitternessLabels)).toBe("Moderately bitter");
      expect(formatBalance(-0.5, bitternessLabels)).toBe("Moderately flat");
    });

    it("should return appropriate strong deviations", () => {
      expect(formatBalance(0.7, acidityLabels)).toBe("Strongly sharp");
      expect(formatBalance(-0.7, acidityLabels)).toBe("Strongly flat");
      expect(formatBalance(0.8, bitternessLabels)).toBe("Strongly bitter");
      expect(formatBalance(-0.8, bitternessLabels)).toBe("Strongly flat");
    });

    it("should return appropriate extreme deviations", () => {
      expect(formatBalance(0.95, acidityLabels)).toBe("Extremely sharp");
      expect(formatBalance(-0.95, acidityLabels)).toBe("Extremely flat");
      expect(formatBalance(1, bitternessLabels)).toBe("Extremely bitter");
      expect(formatBalance(-1, bitternessLabels)).toBe("Extremely flat");
    });

    it("should handle boundary values correctly", () => {
      // Test exact threshold boundaries
      expect(formatBalance(0.25, acidityLabels)).toBe("Slightly sharp"); // exact slight threshold
      expect(formatBalance(0.26, acidityLabels)).toBe("Moderately sharp"); // just over slight
      expect(formatBalance(0.6, acidityLabels)).toBe("Moderately sharp"); // exact moderate threshold
      expect(formatBalance(0.61, acidityLabels)).toBe("Strongly sharp"); // just over moderate
      expect(formatBalance(0.9, acidityLabels)).toBe("Strongly sharp"); // exact strong threshold
      expect(formatBalance(0.91, acidityLabels)).toBe("Extremely sharp"); // just over strong
    });

    it("should handle different label types correctly", () => {
      // Test body labels
      expect(formatBalance(0.3, bodyLabels)).toBe("Moderately heavy");
      expect(formatBalance(-0.3, bodyLabels)).toBe("Moderately watery");

      // Test aftertaste labels
      expect(formatBalance(0.3, aftertasteLabels)).toBe("Moderately harsh");
      expect(formatBalance(-0.3, aftertasteLabels)).toBe("Moderately faint");
    });

    it("should clamp values outside [-1, 1] range", () => {
      expect(formatBalance(2, acidityLabels)).toBe("Extremely sharp");
      expect(formatBalance(-2, acidityLabels)).toBe("Extremely flat");
      expect(formatBalance(1.5, bitternessLabels)).toBe("Extremely bitter");
      expect(formatBalance(-1.5, bitternessLabels)).toBe("Extremely flat");
    });
  });

  describe("formatTastingSummary", () => {
    it("should return 'Balanced overall' when all values are near zero", () => {
      const result = formatTastingSummary({
        acidity: 0,
        bitterness: 0,
        body: 0,
        aftertaste: 0,
      });
      expect(result).toBe("Balanced overall");
    });

    it("should return 'Balanced overall' when all values are below EPS threshold", () => {
      const result = formatTastingSummary({
        acidity: 0.05,
        bitterness: -0.03,
        body: 0.02,
        aftertaste: -0.04,
      });
      expect(result).toBe("Balanced overall");
    });

    it("should format single attribute deviations", () => {
      const result = formatTastingSummary({
        acidity: 0.3,
        bitterness: 0.05,
        body: 0.02,
        aftertaste: -0.03,
      });
      expect(result).toBe("Moderately sharp");
    });

    it("should format multiple attributes in order of severity", () => {
      const result = formatTastingSummary({
        acidity: 0.7, // strong
        bitterness: 0.3, // moderate
        body: 0.1, // slight
        aftertaste: 0.95, // extreme
      });
      expect(result).toBe(
        "Extremely harsh, Strongly sharp, Moderately bitter, Slightly heavy"
      );
    });

    it("should group attributes by band severity", () => {
      const result = formatTastingSummary({
        acidity: 0.8, // strong
        bitterness: 0.75, // strong
        body: 0.2, // slight
        aftertaste: 0.15, // slight
      });
      expect(result).toBe("Strongly bitter, sharp, Slightly harsh, heavy");
    });

    it("should handle negative deviations correctly", () => {
      const result = formatTastingSummary({
        acidity: -0.4,
        bitterness: -0.7,
        body: -0.2,
        aftertaste: -0.8,
      });
      expect(result).toBe(
        "Strongly flat, faint, Moderately flat, Slightly watery"
      );
    });

    it("should handle mixed positive and negative deviations", () => {
      const result = formatTastingSummary({
        acidity: 0.6, // moderate
        bitterness: -0.3, // moderate
        body: 0.9, // strong
        aftertaste: -0.1, // slight
      });
      expect(result).toBe(
        "Strongly heavy, Moderately flat, sharp, Slightly faint"
      );
    });

    it("should remove duplicate adjectives within the same band", () => {
      const result = formatTastingSummary({
        acidity: 0.3,
        bitterness: 0.35,
        body: 0.4,
        aftertaste: 0.32,
      });
      // All should be moderate, so should group them together
      expect(result).toContain("Moderately");
      expect(
        result.split(", ").filter((part) => part.includes("Moderately")).length
      ).toBe(1);
    });

    it("should handle extreme values", () => {
      const result = formatTastingSummary({
        acidity: 1,
        bitterness: -1,
        body: 1,
        aftertaste: -1,
      });
      expect(result).toBe("Extremely flat, sharp, faint, heavy");
    });

    it("should prioritize attributes by their absolute values", () => {
      const result = formatTastingSummary({
        acidity: 0.9, // extreme
        bitterness: 0.1, // slight
        body: 0.8, // strong
        aftertaste: 0.5, // moderate
      });
      // Should order by severity: extreme → strong → moderate → slight
      expect(result).toBe(
        "Strongly sharp, heavy, Moderately harsh, Slightly bitter"
      );
    });

    it("should handle values at exact thresholds", () => {
      const result = formatTastingSummary({
        acidity: 0.25, // exact slight threshold
        bitterness: 0.6, // exact moderate threshold
        body: 0.9, // exact strong threshold
        aftertaste: 1, // extreme
      });
      expect(result).toBe(
        "Extremely harsh, Strongly heavy, Moderately bitter, Slightly sharp"
      );
    });

    it("should handle boundary cases correctly", () => {
      // Test EPS boundary
      const result1 = formatTastingSummary({
        acidity: 0.08, // exactly EPS
        bitterness: 0,
        body: 0,
        aftertaste: 0,
      });
      expect(result1).toBe("Slightly sharp");

      // Test just under EPS
      const result2 = formatTastingSummary({
        acidity: 0.079, // just under EPS
        bitterness: 0,
        body: 0,
        aftertaste: 0,
      });
      expect(result2).toBe("Balanced overall");
    });

    it("should handle complex real-world scenarios", () => {
      // Scenario: Over-extracted shot (bitter, harsh aftertaste, heavy body)
      const overExtracted = formatTastingSummary({
        acidity: -0.2, // slightly flat
        bitterness: 0.7, // strongly bitter
        body: 0.8, // strongly heavy
        aftertaste: 0.9, // extremely harsh
      });
      expect(overExtracted).toBe(
        "Strongly bitter, harsh, heavy, Slightly flat"
      );

      // Scenario: Under-extracted shot (sharp, flat, watery)
      const underExtracted = formatTastingSummary({
        acidity: 0.6, // moderately sharp
        bitterness: -0.3, // moderately flat
        body: -0.7, // strongly watery
        aftertaste: -0.2, // slightly faint
      });
      expect(underExtracted).toBe(
        "Strongly watery, Moderately flat, sharp, Slightly faint"
      );
    });

    it("should handle empty result case gracefully", () => {
      // This shouldn't happen in practice, but test edge case
      const result = formatTastingSummary({
        acidity: 0.001,
        bitterness: 0.002,
        body: 0.003,
        aftertaste: 0.004,
      });
      expect(result).toBe("Balanced overall");
    });
  });

  describe("band classification edge cases", () => {
    it("should handle values exactly at band thresholds", () => {
      // Test slight threshold
      expect(formatBalance(0.25, ["Flat", "Sweet Spot", "Sharp"])).toBe(
        "Slightly sharp"
      );

      // Test moderate threshold
      expect(formatBalance(0.6, ["Flat", "Sweet Spot", "Sharp"])).toBe(
        "Moderately sharp"
      );

      // Test strong threshold
      expect(formatBalance(0.9, ["Flat", "Sweet Spot", "Sharp"])).toBe(
        "Strongly sharp"
      );
    });

    it("should handle very small non-zero values", () => {
      const result = formatTastingSummary({
        acidity: 0.081, // just over EPS
        bitterness: 0,
        body: 0,
        aftertaste: 0,
      });
      expect(result).toBe("Slightly sharp");
    });

    it("should handle precision edge cases", () => {
      // Test floating point precision issues
      const result = formatTastingSummary({
        acidity: 0.2500001, // just over 0.25 threshold
        bitterness: 0,
        body: 0,
        aftertaste: 0,
      });
      expect(result).toBe("Moderately sharp");
    });
  });
});
