export type Palette = {
  bg: string;
  bgSurface: string;
  bgElevated: string;
  borderSubtle: string;
  borderEmphasis: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  dener: string;
  iothas: string;
  scrim: string;
};

export const darkPalette: Palette = {
  bg: "#0e0f12",
  bgSurface: "#16181d",
  bgElevated: "#1c1f25",

  borderSubtle: "#23252a",
  borderEmphasis: "#33363c",

  textPrimary: "#f4f4f6",
  textSecondary: "#a8a8b0",
  textMuted: "#7d7d85",
  textFaint: "#5a5a62",

  dener: "#b8c4dc",
  iothas: "#d87070",

  scrim: "rgba(14, 15, 18, 0.6)",
};

export const lightPalette: Palette = {
  bg: "#f5f3ee",
  bgSurface: "#ece8e0",
  bgElevated: "#e2dcd2",

  borderSubtle: "#d8d2c6",
  borderEmphasis: "#b8b0a2",

  textPrimary: "#16181d",
  textSecondary: "#4a4a52",
  textMuted: "#6d6d75",
  textFaint: "#9a9aa2",

  dener: "#4a5878",
  iothas: "#b04848",

  scrim: "rgba(245, 243, 238, 0.6)",
};

export const fonts = {
  sans: "Inter_400Regular",
  sansMed: "Inter_500Medium",
  sansSemi: "Inter_600SemiBold",
  sansBold: "Inter_700Bold",
  mono: "JetBrainsMono_400Regular",
  monoMed: "JetBrainsMono_500Medium",
} as const;

export const type = {
  display: { fontSize: 56, lineHeight: 60, letterSpacing: -1.4, fontFamily: fonts.sansSemi },
  hero: { fontSize: 44, lineHeight: 48, letterSpacing: -1.2, fontFamily: fonts.sansSemi },
  title: { fontSize: 26, lineHeight: 32, letterSpacing: -0.4, fontFamily: fonts.sansSemi },
  subtitle: { fontSize: 16, lineHeight: 24, fontFamily: fonts.sans },
  bodyLg: { fontSize: 17, lineHeight: 28, fontFamily: fonts.sans },
  body: { fontSize: 16, lineHeight: 26, fontFamily: fonts.sans },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fonts.mono, letterSpacing: 0.5 },
  label: { fontSize: 11, lineHeight: 14, fontFamily: fonts.mono, letterSpacing: 1.5 },
  pullQuote: { fontSize: 36, lineHeight: 44, letterSpacing: -0.6, fontFamily: fonts.sansSemi },
} as const;

export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
  giant: 80,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  pill: 999,
} as const;

export const breakpoints = {
  tablet: 768,
  web: 1200,
} as const;

export type FontFamilies = typeof fonts;
export type Type = typeof type;
