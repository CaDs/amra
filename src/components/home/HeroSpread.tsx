import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { space, type, type Palette } from "../../theme/tokens";
import { useTheme } from "../../theme/useTheme";
import { useHaptics } from "../../hooks/useHaptics";
import type { HomeSpread as HomeSpreadData } from "../../types/lore";

type Props = {
  spread: HomeSpreadData;
  index: number;
  total: number;
  scrollY: SharedValue<number>;
  pageHeight: number;
  onOpen: () => void;
};

export function HeroSpread({ spread, index, total, scrollY, pageHeight, onOpen }: Props) {
  const { palette } = useTheme();
  const haptics = useHaptics();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  const range = useMemo(
    () => [(index - 1) * pageHeight, index * pageHeight, (index + 1) * pageHeight] as const,
    [index, pageHeight],
  );

  const titleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, range, [0.2, 1, 0.2], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, range, [32, 0, -32], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const chromeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, range, [0, 1, 0], Extrapolation.CLAMP);
    return { opacity };
  });

  const indexLabel = String(index + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");
  const kicker = spread.routeGazetteer ? "ATLAS" : `CHAPTER ${indexLabel} OF ${totalLabel}`;

  return (
    <View style={[styles.page, { height: pageHeight }]}>
      <Animated.View style={[styles.chrome, styles.chromeTop, chromeStyle]}>
        <Text style={styles.label}>amra</Text>
        <Text style={styles.label}>
          {indexLabel} / {totalLabel}
        </Text>
      </Animated.View>

      <Pressable
        style={styles.heroButton}
        onPress={() => {
          haptics.medium();
          onOpen();
        }}
        accessibilityRole="button"
        accessibilityLabel={`Open ${spread.title}`}
      >
        <Animated.View style={[styles.heroBlock, titleStyle]}>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={styles.heroTitle}>{spread.title}</Text>
          {spread.subTitle ? (
            <Text style={styles.heroSubtitle} numberOfLines={2}>
              {spread.subTitle.toLowerCase()}
            </Text>
          ) : null}
          {spread.pullQuote ? (
            <View style={styles.pullQuoteRow}>
              <Text style={styles.pullQuoteTop}>{spread.pullQuote.top}</Text>
              <Text style={styles.pullQuoteBottom}>{spread.pullQuote.bottom}</Text>
            </View>
          ) : null}
        </Animated.View>
      </Pressable>

      <Animated.View style={[styles.chrome, styles.chromeBottom, chromeStyle]}>
        <Text style={styles.label}>{spread.routeGazetteer ? "atlas" : "tome"}</Text>
        <Text style={styles.label}>tap to read →</Text>
      </Animated.View>
    </View>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    page: {
      width: "100%",
      paddingHorizontal: space.xl,
      paddingTop: space.huge,
      paddingBottom: space.xxl,
      justifyContent: "space-between",
    },
    chrome: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    chromeTop: {},
    chromeBottom: {},
    heroButton: {
      flex: 1,
      justifyContent: "center",
    },
    heroBlock: {
      alignItems: "flex-start",
      gap: space.sm,
    },
    kicker: {
      ...type.label,
      color: palette.textMuted,
      marginBottom: space.xs,
    },
    heroTitle: {
      ...type.hero,
      color: palette.textPrimary,
    },
    heroSubtitle: {
      ...type.subtitle,
      color: palette.textSecondary,
      marginTop: space.xxs,
    },
    pullQuoteRow: {
      marginTop: space.xl,
    },
    pullQuoteTop: {
      ...type.subtitle,
      fontSize: 20,
      lineHeight: 28,
      color: palette.textPrimary,
    },
    pullQuoteBottom: {
      ...type.subtitle,
      fontSize: 20,
      lineHeight: 28,
      color: palette.iothas,
    },
    label: {
      ...type.label,
      color: palette.textFaint,
    },
  });
