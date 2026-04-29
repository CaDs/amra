import { useSettings } from "../state/SettingsContext";
import { darkPalette, lightPalette, type Palette } from "./tokens";

export type ThemeMode = "dark" | "light";

export type Theme = {
  mode: ThemeMode;
  palette: Palette;
  isDark: boolean;
  isLight: boolean;
};

export function useTheme(): Theme {
  const { themeMode } = useSettings();
  const palette = themeMode === "light" ? lightPalette : darkPalette;
  return {
    mode: themeMode,
    palette,
    isDark: themeMode === "dark",
    isLight: themeMode === "light",
  };
}
