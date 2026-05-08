import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { onImage, space, type, type Palette } from "../../theme/tokens";
import { useTheme } from "../../theme/useTheme";
import { useHaptics } from "../../hooks/useHaptics";
import type { HomeSpread as HomeSpreadData } from "../../types/lore";
import { FocalImage } from "../primitives/FocalImage";
import type { HeroImage } from "../../data/heroImages";

type Props = {
  spread: HomeSpreadData;
  index: number;
  total: number;
  scrollY: SharedValue<number>;
  pageHeight: number;
  onOpen: () => void;
  heroImage?: HeroImage;
};

export function HeroSpread({ spread, index, total, scrollY, pageHeight, onOpen, heroImage }: Props) {
  const { palette } = useTheme();
  const haptics = useHaptics();
  const onPhoto = !!heroImage;
  const styles = useMemo(() => makeStyles(palette, onPhoto), [palette, onPhoto]);

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

  const imageStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, range, [0, 1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, range, [pageHeight * 0.12, 0, -pageHeight * 0.12], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const indexLabel = String(index + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");
  const kicker = spread.routeGazetteer ? "ATLAS" : `CHAPTER ${indexLabel} OF ${totalLabel}`;

  return (
    <View style={[styles.page, { height: pageHeight }]}>
      {heroImage ? (
        <Animated.View style={[StyleSheet.absoluteFill, imageStyle]} pointerEvents="none">
          <FocalImage source={heroImage.source} {...(heroImage.focal ? { focal: heroImage.focal } : {})} />
          <View style={styles.imageOverlay} />
        </Animated.View>
      ) : null}

      <Animated.View style={[styles.chrome, styles.chromeTop, chromeStyle]}>
        <View />
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

const makeStyles = (palette: Palette, onPhoto: boolean) => {
  const c = onPhoto
    ? {
        kicker: onImage.textMuted,
        title: onImage.textPrimary,
        subtitle: onImage.textSecondary,
        pullQuoteTop: onImage.textPrimary,
        pullQuoteBottom: onImage.iothas,
        label: onImage.textFaint,
      }
    : {
        kicker: palette.textMuted,
        title: palette.textPrimary,
        subtitle: palette.textSecondary,
        pullQuoteTop: palette.textPrimary,
        pullQuoteBottom: palette.iothas,
        label: palette.textFaint,
      };
  return StyleSheet.create({
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
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: onImage.scrim,
    },
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
      color: c.kicker,
      marginBottom: space.xs,
    },
    heroTitle: {
      ...type.hero,
      color: c.title,
    },
    heroSubtitle: {
      ...type.subtitle,
      color: c.subtitle,
      marginTop: space.xxs,
    },
    pullQuoteRow: {
      marginTop: space.xl,
    },
    pullQuoteTop: {
      ...type.subtitle,
      fontSize: 20,
      lineHeight: 28,
      color: c.pullQuoteTop,
    },
    pullQuoteBottom: {
      ...type.subtitle,
      fontSize: 20,
      lineHeight: 28,
      color: c.pullQuoteBottom,
    },
    label: {
      ...type.label,
      color: c.label,
    },
  });
};
