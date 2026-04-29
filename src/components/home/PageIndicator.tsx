import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { space, type Palette } from "../../theme/tokens";
import { useTheme } from "../../theme/useTheme";

type Props = {
  total: number;
  pageHeight: number;
  scrollY: SharedValue<number>;
};

export function PageIndicator({ total, pageHeight, scrollY }: Props) {
  const { palette } = useTheme();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  return (
    <View style={[styles.rail, { pointerEvents: "none" }]}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} index={i} pageHeight={pageHeight} scrollY={scrollY} dotStyle={styles.dot} />
      ))}
    </View>
  );
}

function Dot({
  index,
  pageHeight,
  scrollY,
  dotStyle,
}: {
  index: number;
  pageHeight: number;
  scrollY: SharedValue<number>;
  dotStyle: { width: number; backgroundColor: string; borderRadius: number };
}) {
  const style = useAnimatedStyle(() => {
    const range = [(index - 1) * pageHeight, index * pageHeight, (index + 1) * pageHeight];
    const opacity = interpolate(scrollY.value, range, [0.25, 1, 0.25], Extrapolation.CLAMP);
    const height = interpolate(scrollY.value, range, [4, 18, 4], Extrapolation.CLAMP);
    return { opacity, height };
  });
  return <Animated.View style={[dotStyle, style]} />;
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    rail: {
      position: "absolute",
      right: space.md,
      top: "30%",
      bottom: "30%",
      width: 12,
      alignItems: "center",
      justifyContent: "center",
      gap: space.xs,
    },
    dot: {
      width: 2,
      backgroundColor: palette.dener,
      borderRadius: 1,
    },
  });
