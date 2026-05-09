import { Platform } from 'react-native';

export const esafFonts = {
  sans: Platform.select({
    ios: 'Helvetica Neue',
    default: 'system-ui, sans-serif',
    web: 'system-ui, sans-serif',
  }) as string,
  mono: Platform.select({
    ios: 'Courier New',
    default: 'monospace',
    web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
  }) as string,
};

// Notes:
// - Your provided design-system uses CSS variables + oklch/hsl.
// - React Native does not support CSS variables or oklch() in style sheets.
// - For RN we provide the final color values as HSL strings (where we can) or HEX.
//   (Using HSL strings works in RN style props across iOS/Android.)

export const esafColors = {
  // ESAF “brand” / semantic tokens
  brand: {
    red: 'hsl(357 70% 50%)',
    redDark: 'hsl(357 75% 41%)',
    navy: 'hsl(222 73% 19%)',
    amber: 'hsl(35 91% 55%)',
    green: 'hsl(144 80% 26%)',
  },
  // Page
  page: {
    bg: 'hsl(220 13% 97%)',
    textMute: 'hsl(220 19% 44%)',
    textFaint: 'hsl(220 19% 67%)',
  },
  // Status backgrounds/text
  status: {
    successBg: 'hsl(145 56% 93%)',
    infoBg: 'hsl(213 75% 95%)',
    warnBg: 'hsl(44 100% 95%)',
    dangerBg: 'hsl(357 79% 95%)',
  },
  // ESAF raw tokens (used by your original CSS)
  esaf: {
    red: 'hsl(358 70% 49%)',
    redDark: 'hsl(357 76% 40%)',
    navy: 'hsl(220 73% 19%)',
    amber: 'hsl(36 91% 55%)',
    amberText: 'hsl(38 100% 27%)',
    green: 'hsl(144 81% 26%)',
    page: 'hsl(220 13% 97%)',
    textMute: 'hsl(220 19% 44%)',
    textFaint: 'hsl(220 19% 67%)',
    successBg: 'hsl(144 56% 93%)',
    infoBg: 'hsl(215 81% 95%)',
    warnBg: 'hsl(42 100% 95%)',
    dangerBg: 'hsl(354 80% 95%)',
  },
};

export const esafRadius = {
  sm: 0.875 * 0.0,
  // Keep RN radii in px-like numbers (matching your current UI). You can expand later.
  // The design system uses rem offsets; for now we map to the existing look.
  md: 12,
  lg: 16,
  xl: 18,
  '2xl': 24,
};

