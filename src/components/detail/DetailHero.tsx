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
import { Hairline } from "../primitives/Hairline";

type Props = {
  title: string;
  subTitle?: string;
  kicker: string;
  scrollY: SharedValue<number>;
  height: number;
};

export function DetailHero({ title, subTitle, kicker, scrollY, height }: Props) {
  const { palette } = useTheme();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  const heroStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, height * 0.6, height], [1, 0.5, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, height], [0, -height * 0.3], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <View style={[styles.outer, { height, pointerEvents: "none" }]}>
      <Animated.View style={[styles.inner, heroStyle]}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.title}>{title}</Text>
        {subTitle ? <Text style={styles.subtitle}>{subTitle.toLowerCase()}</Text> : null}
        <Hairline width={56} style={{ marginTop: space.lg, backgroundColor: palette.dener }} />
      </Animated.View>
    </View>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    outer: {
      width: "100%",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      paddingHorizontal: space.xl,
      paddingTop: space.giant + space.md,
    },
    inner: {
      alignItems: "flex-start",
      gap: space.xs,
    },
    kicker: {
      ...type.label,
      color: palette.textMuted,
      marginBottom: space.sm,
    },
    title: {
      ...type.display,
      color: palette.textPrimary,
    },
    subtitle: {
      ...type.subtitle,
      color: palette.textSecondary,
      marginTop: space.xs,
    },
  });
