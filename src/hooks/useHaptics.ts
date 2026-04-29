import { useMemo } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

import { useSettings } from "../state/SettingsContext";

export type HapticsApi = {
  selection: () => void;
  light: () => void;
  medium: () => void;
};

const NOOP: HapticsApi = {
  selection: () => {},
  light: () => {},
  medium: () => {},
};

export function useHaptics(): HapticsApi {
  const { haptics } = useSettings();

  return useMemo<HapticsApi>(() => {
    if (!haptics || Platform.OS === "web") return NOOP;
    return {
      selection: () => {
        Haptics.selectionAsync().catch(() => {});
      },
      light: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      },
      medium: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      },
    };
  }, [haptics]);
}
