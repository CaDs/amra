import { useMemo } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import Constants from "expo-constants";

import { ScreenFrame } from "../../src/components/primitives/ScreenFrame";
import { Hairline } from "../../src/components/primitives/Hairline";
import { HamburgerButton } from "../../src/components/nav/HamburgerButton";
import { space, type as typeTokens, type Palette } from "../../src/theme/tokens";
import { useTheme, type ThemeMode } from "../../src/theme/useTheme";
import { useSettings } from "../../src/state/SettingsContext";
import { useHaptics } from "../../src/hooks/useHaptics";

const PUBLISHER_URL = "https://gamecanvas.ai/";

export default function SettingsRoute() {
  const { palette } = useTheme();
  const haptics = useHaptics();
  const settings = useSettings();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const version = Constants.expoConfig?.version ?? "0.0.0";

  return (
    <ScreenFrame>
      <HamburgerButton />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.measure}>
          <Text style={styles.kicker}></Text>
          <Text style={styles.title}>Settings</Text>
          <Hairline width={56} style={styles.rule} />

          <Text style={styles.sectionLabel}>PREFERENCES</Text>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Haptics</Text>
              <Text style={styles.rowSubtitle}>Tactile feedback on taps and transitions.</Text>
            </View>
            <Switch
              value={settings.haptics}
              onValueChange={(next) => {
                haptics.selection();
                settings.update({ haptics: next });
              }}
              trackColor={{ false: palette.borderEmphasis, true: palette.iothas }}
              thumbColor={Platform.OS === "android" ? palette.bg : undefined}
            />
          </View>
          <Hairline />

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Appearance</Text>
              <Text style={styles.rowSubtitle}>Choose between dark and bright modes.</Text>
            </View>
            <ThemeSegmented
              value={settings.themeMode}
              onChange={(mode) => {
                haptics.selection();
                settings.update({ themeMode: mode });
              }}
              palette={palette}
            />
          </View>
          <Hairline />

          <Text style={[styles.sectionLabel, styles.aboutSection]}>ABOUT THIS APP</Text>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>VERSION</Text>
            <Text style={styles.aboutValue}>{version}</Text>
          </View>
          <Hairline />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>PUBLISHED BY</Text>
            <Text style={styles.aboutValue}>Game Canvas</Text>
          </View>
          <Hairline />

          <Pressable
            style={styles.cta}
            onPress={() => {
              haptics.light();
              Linking.openURL(PUBLISHER_URL).catch(() => {
                /* swallow — link opening fails silently if no handler */
              });
            }}
            accessibilityRole="link"
            accessibilityLabel="Visit Game Canvas website"
          >
            <Text style={styles.ctaLabel}>Visit gamecanvas.ai →</Text>
          </Pressable>

          <Text style={styles.colophon}>
            Set in the medieval-fantasy continent of Amra. All lore content is original to the campaign setting and not a derivative work.
          </Text>
        </View>
      </ScrollView>
    </ScreenFrame>
  );
}

type SegmentedProps = {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  palette: Palette;
};

function ThemeSegmented({ value, onChange, palette }: SegmentedProps) {
  const styles = useMemo(() => makeSegmentedStyles(palette), [palette]);
  return (
    <View style={styles.wrap}>
      <Segment label="Dark" active={value === "dark"} onPress={() => onChange("dark")} styles={styles} />
      <Segment label="Light" active={value === "light"} onPress={() => onChange("light")} styles={styles} />
    </View>
  );
}

function Segment({
  label,
  active,
  onPress,
  styles,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  styles: ReturnType<typeof makeSegmentedStyles>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.segment, active && styles.segmentActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    content: {
      padding: space.xl,
      paddingTop: space.giant + space.md,
      paddingBottom: space.giant * 2,
      alignItems: "center",
    },
    measure: {
      width: "100%",
      maxWidth: 560,
      gap: space.md,
    },
    kicker: {
      ...typeTokens.label,
      color: palette.textMuted,
    },
    title: {
      ...typeTokens.hero,
      color: palette.textPrimary,
    },
    rule: {
      backgroundColor: palette.dener,
      marginVertical: space.md,
    },
    sectionLabel: {
      ...typeTokens.label,
      color: palette.textMuted,
      marginTop: space.md,
      marginBottom: space.xs,
    },
    aboutSection: {
      marginTop: space.xxl,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: space.lg,
      paddingVertical: space.md,
    },
    rowText: {
      flex: 1,
      gap: space.xxs,
    },
    rowTitle: {
      ...typeTokens.bodyLg,
      color: palette.textPrimary,
    },
    rowSubtitle: {
      ...typeTokens.body,
      fontSize: 14,
      lineHeight: 20,
      color: palette.textMuted,
    },
    aboutRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      paddingVertical: space.md,
    },
    aboutLabel: {
      ...typeTokens.label,
      color: palette.textMuted,
    },
    aboutValue: {
      ...typeTokens.body,
      color: palette.textPrimary,
    },
    cta: {
      marginTop: space.xl,
      alignSelf: "flex-start",
      paddingVertical: space.md,
      paddingHorizontal: space.xl,
      borderWidth: 1,
      borderColor: palette.iothas,
      borderRadius: 999,
    },
    ctaLabel: {
      ...typeTokens.label,
      color: palette.iothas,
      fontSize: 12,
      letterSpacing: 1.4,
    },
    colophon: {
      ...typeTokens.body,
      fontSize: 14,
      lineHeight: 22,
      color: palette.textMuted,
      marginTop: space.xxl,
    },
  });

const makeSegmentedStyles = (palette: Palette) =>
  StyleSheet.create({
    wrap: {
      flexDirection: "row",
      borderWidth: 1,
      borderColor: palette.borderEmphasis,
      borderRadius: 999,
      overflow: "hidden",
    },
    segment: {
      paddingVertical: space.xs,
      paddingHorizontal: space.md,
      backgroundColor: "transparent",
    },
    segmentActive: {
      backgroundColor: palette.iothas,
    },
    segmentLabel: {
      ...typeTokens.label,
      fontSize: 11,
      letterSpacing: 1.2,
      color: palette.textSecondary,
    },
    segmentLabelActive: {
      color: "#ffffff",
    },
  });
