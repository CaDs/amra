import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { onImage, type Palette } from "../../theme/tokens";
import { useTheme } from "../../theme/useTheme";
import { FocalImage } from "./FocalImage";
import type { HeroImage } from "../../data/heroImages";

type Props = {
  heroImage?: HeroImage;
  minHeight: number;
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

// A pressable card that uses a hero image as its background when available,
// falling back to a flat surface card. Designed for list/index views where
// we want to leverage the codex art without breaking layout for entries that
// don't have a hero (e.g., noble houses, settlements).
//
// Composition (top → bottom):
//   1. Pressable (border, radius, overflow:hidden)
//   2. FocalImage (absoluteFill, only when heroImage)
//   3. Scrim overlay (only when heroImage)
//   4. Bottom-half darker gradient-ish overlay (only when heroImage)
//   5. Children (kicker / title / subTitle / CTA) anchored to the bottom
//
// The caller is responsible for the children's text colors — on-photo
// callers should use the `onImage.*` palette; flat-fallback callers use the
// regular `palette.*` tokens.
export function BackgroundCard({
  heroImage,
  minHeight,
  onPress,
  accessibilityLabel,
  style,
  children,
}: Props) {
  const { palette } = useTheme();
  const onPhoto = !!heroImage;
  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    {
      minHeight,
      borderColor: palette.borderSubtle,
      backgroundColor: onPhoto ? "#000" : palette.bgSurface,
    },
    style,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        cardStyle,
        pressed && { opacity: 0.55, borderColor: palette.dener },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {heroImage ? (
        <>
          <View style={styles.imageLayer} pointerEvents="none">
            <FocalImage source={heroImage.source} {...(heroImage.focal ? { focal: heroImage.focal } : {})} />
          </View>
          <View style={styles.scrim} pointerEvents="none" />
          <View style={styles.bottomShade} pointerEvents="none" />
        </>
      ) : null}
      <View style={styles.contentInner}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  imageLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: onImage.scrim,
  },
  bottomShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
    backgroundColor: "rgba(0, 0, 0, 0.38)",
  },
  contentInner: {
    padding: 20,
    gap: 8,
  },
});

// Helper to compute consistent text colors for a card based on whether it has
// a background image. Saves the per-call-site ternaries.
export function cardTextColors(palette: Palette, onPhoto: boolean) {
  return onPhoto
    ? {
        kicker: onImage.dener,
        title: onImage.textPrimary,
        subtitle: onImage.textSecondary,
        muted: onImage.textMuted,
      }
    : {
        kicker: palette.dener,
        title: palette.textPrimary,
        subtitle: palette.textSecondary,
        muted: palette.textMuted,
      };
}
