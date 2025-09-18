import colorPalette from "./colorPalette.json";

// Export colors from the palette with TypeScript types
export const colors = {
  primary: colorPalette.primary,
  secondary: colorPalette.secondary,
  starPrimary: colorPalette.starPrimary,
  starSecondary: colorPalette.starSecondary,
  error: colorPalette.error,
  warning: colorPalette.warning,
  positive: colorPalette.positive,
  success: colorPalette.success,
  gray: colorPalette.gray,
  textDark: colorPalette.textDark,
  textMedium: colorPalette.textMedium,
  textLight: colorPalette.textLight,
  bgLight: colorPalette.bgLight,
  borderLight: colorPalette.borderLight,

  // Additional commonly used colors
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",

  // Semantic color mappings for common UI patterns
  background: colorPalette.bgLight,
  surface: "#ffffff",
  text: colorPalette.textDark,
  textSecondary: colorPalette.textMedium,
  textTertiary: colorPalette.textLight,
  border: colorPalette.borderLight,
  divider: "#f0f0f0",
  disabled: "#ccc",
  disabledText: colorPalette.textLight,

  // Status colors
  successBackground: "#d5f4e6",
  errorBackground: "#ffeaea",
  warningBackground: "#fff8dc",

  // Interactive states
  pressed: "#f0f0f0",
  hover: "#f8f8f8",
} as const;

export type ColorKey = keyof typeof colors;
