import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenFrame } from "../src/components/primitives/ScreenFrame";
import { Hairline } from "../src/components/primitives/Hairline";
import { getRegions } from "../src/data/loadLore";
import { space, type, type Palette } from "../src/theme/tokens";
import { useTheme } from "../src/theme/useTheme";
import { useHaptics } from "../src/hooks/useHaptics";

export default function GazetteerRoute() {
  const router = useRouter();
  const { palette } = useTheme();
  const haptics = useHaptics();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const regions = getRegions();

  return (
    <ScreenFrame>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.measure}>
        <Pressable
          style={styles.back}
          onPress={() => {
            haptics.light();
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={styles.backLabel}>← back</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.kicker}>THE GAZETTEER · {String(regions.length).padStart(2, "0")} REGIONS</Text>
          <Text style={styles.title}>Realms of the continent</Text>
          <Text style={styles.lede}>
            From the marble courts of Aregor to the highland clans of Skapta — every realm of Amra in one atlas.
          </Text>
          <Hairline width={56} style={{ marginTop: space.lg, backgroundColor: palette.dener }} />
        </View>

        <View style={styles.grid}>
          {regions.map((r, i) => (
            <Pressable
              key={r.id}
              style={styles.tile}
              onPress={() => {
                haptics.medium();
                router.push({ pathname: "/[tomeId]", params: { tomeId: r.id } });
              }}
              accessibilityRole="button"
              accessibilityLabel={`Open ${r.overview.title}`}
            >
              <Text style={styles.tileIndex}>{String(i + 1).padStart(2, "0")}</Text>
              <Text style={styles.tileTitle}>{r.overview.title}</Text>
              {r.overview.subTitle ? (
                <Text style={styles.tileSub}>{r.overview.subTitle}</Text>
              ) : null}
              <Text style={styles.tileOpen}>read →</Text>
            </Pressable>
          ))}
        </View>
        </View>
      </ScrollView>
    </ScreenFrame>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    content: { padding: space.xl, paddingBottom: space.giant, paddingTop: space.huge, alignItems: "center" },
    measure: { width: "100%", maxWidth: 760, gap: space.xl },
    back: { paddingVertical: space.xs, alignSelf: "flex-start" },
    backLabel: { ...type.label, color: palette.textMuted },
    header: { gap: space.sm },
    kicker: { ...type.label, color: palette.textMuted },
    title: { ...type.hero, color: palette.textPrimary },
    lede: { ...type.bodyLg, color: palette.textSecondary, marginTop: space.xs },
    grid: { gap: space.md, marginTop: space.lg },
    tile: {
      padding: space.lg,
      borderWidth: 1,
      borderColor: palette.borderSubtle,
      borderRadius: 8,
      backgroundColor: palette.bgSurface,
      gap: space.xs,
    },
    tileIndex: { ...type.label, color: palette.dener },
    tileTitle: { ...type.title, fontSize: 22, lineHeight: 26, color: palette.textPrimary },
    tileSub: { ...type.body, color: palette.textSecondary, fontSize: 14, lineHeight: 20 },
    tileOpen: { ...type.label, color: palette.textMuted, marginTop: space.xs },
  });
