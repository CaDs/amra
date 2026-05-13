import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { onImage, space, type, type Palette } from "../../theme/tokens";
import { useTheme } from "../../theme/useTheme";
import { useKenBurns } from "../../hooks/useKenBurns";
import { Hairline } from "../primitives/Hairline";
import { FocalImage } from "../primitives/FocalImage";
import type { HeroImage } from "../../data/heroImages";

type Props = {
  title: string;
  subTitle?: string;
  kicker: string;
  scrollY: SharedValue<number>;
  height: number;
  heroImage?: HeroImage;
  compact?: boolean;
};

export function DetailHero({ title, subTitle, kicker, scrollY, height, heroImage, compact }: Props) {
  const { palette } = useTheme();
  const onPhoto = !!heroImage;
  const styles = useMemo(() => makeStyles(palette, onPhoto, !!compact), [palette, onPhoto, compact]);
  const ambientStyle = useKenBurns();
  const denerColor = onPhoto ? onImage.dener : palette.dener;

  const heroStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, height * 0.6, height], [1, 0.5, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, height], [0, -height * 0.3], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const imageStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, height * 0.6, height], [1, 0.4, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, height], [0, -height * 0.15], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <View style={[styles.outer, { height, pointerEvents: "none" }]}>
      {heroImage ? (
        <Animated.View style={[styles.imageContainer, imageStyle]} pointerEvents="none">
          <Animated.View style={[styles.ambientCover, ambientStyle]} pointerEvents="none">
            <FocalImage source={heroImage.source} {...(heroImage.focal ? { focal: heroImage.focal } : {})} />
          </Animated.View>
          <View style={styles.imageOverlay} />
        </Animated.View>
      ) : null}
      <Animated.View style={[styles.inner, heroStyle]}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.title}>{title}</Text>
        {subTitle ? <Text style={styles.subtitle}>{subTitle.toLowerCase()}</Text> : null}
        <Hairline width={56} style={{ marginTop: space.lg, backgroundColor: denerColor }} />
      </Animated.View>
    </View>
  );
}

const makeStyles = (palette: Palette, onPhoto: boolean, compact: boolean) => {
  const c = onPhoto
    ? {
        kicker: onImage.textMuted,
        title: onImage.textPrimary,
        subtitle: onImage.textSecondary,
      }
    : {
        kicker: palette.textMuted,
        title: palette.textPrimary,
        subtitle: palette.textSecondary,
      };
  return StyleSheet.create({
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
      color: c.kicker,
      marginBottom: space.sm,
    },
    title: {
      ...(compact ? type.hero : type.display),
      color: c.title,
    },
    subtitle: {
      ...type.subtitle,
      color: c.subtitle,
      marginTop: space.xs,
    },
    imageContainer: {
      ...StyleSheet.absoluteFillObject,
      overflow: "hidden",
    },
    ambientCover: {
      position: "absolute",
      top: -24,
      bottom: -24,
      left: -24,
      right: -24,
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: onImage.scrim,
    },
  });
};
