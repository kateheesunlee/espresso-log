import colorPalette from './colorPalette.json';
import { useTheme } from './ThemeContext';

// Type for theme mode
type ThemeMode = 'light' | 'dark';

// Helper function to get color palette for a specific theme
const getPalette = (theme: ThemeMode) => {
  return colorPalette[theme];
};

// Function to get colors for a specific theme
export const getColors = (theme: ThemeMode = 'light') => {
  const palette = getPalette(theme);

  return {
    primary: palette.primary,
    primaryLight: palette.primaryLight,
    primaryLighter: palette.primaryLighter,
    star: palette.star,
    starLight: palette.starLight,
    heart: palette.heart,
    heartLight: palette.heartLight,
    error: palette.error,
    warning: palette.warning,
    positive: palette.positive,
    success: palette.success,
    gray: palette.gray,
    textDark: palette.textDark,
    textMedium: palette.textMedium,
    textLight: palette.textLight,
    bgLight: palette.bgLight,
    borderLight: palette.borderLight,

    // Roasting colors
    roastingLight: palette.roastingLight,
    roastingLight_Light: palette.roastingLight_Light,
    roastingMediumLight: palette.roastingMediumLight,
    roastingMediumLight_Light: palette.roastingMediumLight_Light,
    roastingMedium: palette.roastingMedium,
    roastingMedium_Light: palette.roastingMedium_Light,
    roastingMediumDark: palette.roastingMediumDark,
    roastingMediumDark_Light: palette.roastingMediumDark_Light,
    roastingDark: palette.roastingDark,
    roastingDark_Light: palette.roastingDark_Light,

    // Additional commonly used colors
    white: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    black: theme === 'dark' ? '#ffffff' : '#000000',
    transparent: 'transparent',

    // Semantic color mappings for common UI patterns
    background: palette.bgLight,
    surface: theme === 'dark' ? '#2a2a2a' : '#ffffff',
    text: palette.textDark,
    textSecondary: palette.textMedium,
    textTertiary: palette.textLight,
    border: palette.borderLight,
    divider: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
    disabled: theme === 'dark' ? '#444444' : '#ccc',
    disabledText: palette.textLight,

    // Status colors
    successBackground: theme === 'dark' ? '#1a3a2a' : '#d5f4e6',
    errorBackground: theme === 'dark' ? '#3a1a1a' : '#ffeaea',
    warningBackground: theme === 'dark' ? '#3a2a1a' : '#fff8dc',

    // Interactive states
    pressed: theme === 'dark' ? '#3a3a3a' : '#f0f0f0',
    hover: theme === 'dark' ? '#2f2f2f' : '#f8f8f8',
  } as const;
};

// Export default light theme colors for backward compatibility
export const colors = getColors('light');

export type ColorKey = keyof ReturnType<typeof getColors>;

// Hook to use colors with current theme
export const useColors = () => {
  const { theme } = useTheme();
  return getColors(theme);
};
