import { useEffect } from "react";
import {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type AnimatedStyle,
} from "react-native-reanimated";
import type { ViewStyle } from "react-native";
import { useReducedMotion } from "./useReducedMotion";

// Returns an animated transform style (scale + translateX/Y drift) for hero
// images. Three independent loops with incommensurate periods (8s / 11s / 14s)
// keep the motion from ever feeling like a metronome. Skipped entirely when
// the user has Reduce Motion enabled.
export function useKenBurns(): AnimatedStyle<ViewStyle> {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      cancelAnimation(scale);
      cancelAnimation(tx);
      cancelAnimation(ty);
      scale.value = 1;
      tx.value = 0;
      ty.value = 0;
      return;
    }
    scale.value = 1;
    scale.value = withRepeat(
      withTiming(1.08, { duration: 8000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    tx.value = -16;
    tx.value = withRepeat(
      withTiming(16, { duration: 11000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    ty.value = -12;
    ty.value = withRepeat(
      withTiming(12, { duration: 14000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(scale);
      cancelAnimation(tx);
      cancelAnimation(ty);
    };
  }, [reduced, scale, tx, ty]);

  return useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));
}
