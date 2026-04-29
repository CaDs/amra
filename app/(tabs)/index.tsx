import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenFrame } from "../../src/components/primitives/ScreenFrame";
import { Hairline } from "../../src/components/primitives/Hairline";
import { space, type as typeTokens, type Palette } from "../../src/theme/tokens";
import { useTheme } from "../../src/theme/useTheme";
import { useHaptics } from "../../src/hooks/useHaptics";

export default function HomeRoute() {
  const router = useRouter();
  const { palette } = useTheme();
  const haptics = useHaptics();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  return (
    <ScreenFrame>
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

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
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
      color: palette.dener,
    },
    welcome: {
      ...typeTokens.title,
      color: palette.textSecondary,
      fontSize: 22,
      lineHeight: 28,
      marginTop: space.xs,
    },
    title: {
      ...typeTokens.display,
      color: palette.textPrimary,
      marginTop: -space.xxs,
    },
    rule: {
      backgroundColor: palette.iothas,
      marginTop: space.sm,
    },
    lede: {
      ...typeTokens.bodyLg,
      color: palette.textSecondary,
      marginTop: space.xs,
    },
    cta: {
      marginTop: space.xl,
      paddingVertical: space.md,
      paddingHorizontal: space.xl,
      borderWidth: 1,
      borderColor: palette.borderEmphasis,
      borderRadius: 999,
      backgroundColor: palette.bgSurface,
    },
    ctaLabel: {
      ...typeTokens.label,
      color: palette.textPrimary,
      fontSize: 12,
      letterSpacing: 1.4,
    },
  });
