import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { space, type, type Palette } from "../../theme/tokens";
import { useTheme } from "../../theme/useTheme";
import type { PullQuote } from "../../types/lore";

type Props = {
  pullQuote: PullQuote;
  scrollY: SharedValue<number>;
  startAt: number;
  height: number;
};

export function PullQuoteSplash({ pullQuote, scrollY, startAt, height }: Props) {
  const { palette } = useTheme();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  const animated = useAnimatedStyle(() => {
    const range = [startAt - height, startAt - height * 0.4, startAt + height * 0.5, startAt + height];
    const opacity = interpolate(scrollY.value, range, [0, 1, 1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, range, [32, 0, -8, -32], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <View style={[styles.outer, { height }]}>
      <Animated.View style={[styles.inner, animated]}>
        <Text style={styles.top}>{pullQuote.top}</Text>
        <Text style={styles.bottom}>{pullQuote.bottom}</Text>
      </Animated.View>
    </View>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    outer: {
      width: "100%",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingHorizontal: space.xl,
    },
    inner: {
      alignItems: "flex-start",
      gap: 4,
    },
    top: {
      ...type.pullQuote,
      color: palette.textPrimary,
    },
    bottom: {
      ...type.pullQuote,
      color: palette.iothas,
    },
  });
