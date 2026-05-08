import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenFrame } from "../../src/components/primitives/ScreenFrame";
import { Hairline } from "../../src/components/primitives/Hairline";
import { FocalImage } from "../../src/components/primitives/FocalImage";
import { HamburgerButton } from "../../src/components/nav/HamburgerButton";
import { onImage, space, type as typeTokens } from "../../src/theme/tokens";
import { useHaptics } from "../../src/hooks/useHaptics";

const welcomeImage = require("../../assets/images/welcome.webp");

export default function HomeRoute() {
  const router = useRouter();
  const haptics = useHaptics();

  return (
    <ScreenFrame>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <FocalImage source={welcomeImage} />
        <View style={styles.overlay} />
      </View>
      <HamburgerButton />
      <View style={styles.center}>
        <View style={styles.measure}>
          <Text style={styles.kicker}>A WORLD COMPENDIUM</Text>
          <Text style={styles.welcome}>Welcome to</Text>
          <Text style={styles.title}>Amra</Text>
          <Hairline width={56} style={styles.rule} />
          <Text style={styles.lede}>
            Seven chapters and seventeen realms — a continent of marble courts, highland clans, and the long memory of fire.
          </Text>

          <Pressable
            style={styles.cta}
            onPress={() => {
              haptics.medium();
              router.push("/lore");
            }}
            accessibilityRole="button"
            accessibilityLabel="Begin Reading"
          >
            <Text style={styles.ctaLabel}>Begin Reading →</Text>
          </Pressable>
        </View>
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: onImage.scrim,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.xl,
  },
  measure: {
    width: "100%",
    maxWidth: 560,
    alignItems: "flex-start",
    gap: space.md,
  },
  kicker: {
    ...typeTokens.label,
    color: onImage.dener,
  },
  welcome: {
    ...typeTokens.title,
    color: onImage.textSecondary,
    fontSize: 22,
    lineHeight: 28,
    marginTop: space.xs,
  },
  title: {
    ...typeTokens.display,
    color: onImage.textPrimary,
    marginTop: -space.xxs,
  },
  rule: {
    backgroundColor: onImage.iothas,
    marginTop: space.sm,
  },
  lede: {
    ...typeTokens.bodyLg,
    color: onImage.textSecondary,
    marginTop: space.xs,
  },
  cta: {
    marginTop: space.xl,
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    borderWidth: 1,
    borderColor: "rgba(244, 244, 246, 0.4)",
    borderRadius: 999,
    backgroundColor: "rgba(244, 244, 246, 0.92)",
  },
  ctaLabel: {
    ...typeTokens.label,
    color: "#16181d",
    fontSize: 12,
    letterSpacing: 1.4,
  },
});
