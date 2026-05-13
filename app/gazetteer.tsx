import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { ScreenFrame } from "../src/components/primitives/ScreenFrame";
import { Hairline } from "../src/components/primitives/Hairline";
import { BackgroundCard, cardTextColors } from "../src/components/primitives/BackgroundCard";
import { getRegions } from "../src/data/loadLore";
import { getHeroImage } from "../src/data/heroImages";
import { space, type, type Palette } from "../src/theme/tokens";
import { useTheme } from "../src/theme/useTheme";
import { useHaptics } from "../src/hooks/useHaptics";

export default function GazetteerRoute() {
  const router = useRouter();
  const navigation = useNavigation();
  const { palette } = useTheme();
  const haptics = useHaptics();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const regions = getRegions();

  const hapticsRef = useRef(haptics);
  hapticsRef.current = haptics;
  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove" as never, () => {
      hapticsRef.current.light();
    });
    return unsub;
  }, [navigation]);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const fireScrollHaptic = useCallback(() => hapticsRef.current.selection(), []);
  const lastHapticY = useSharedValue(0);
  useAnimatedReaction(
    () => scrollY.value,
    (y, prev) => {
      if (prev === null) {
        lastHapticY.value = y;
        return;
      }
      if (Math.abs(y - lastHapticY.value) >= 120) {
        lastHapticY.value = y;
        runOnJS(fireScrollHaptic)();
      }
    },
  );

  return (
    <ScreenFrame>
      <Animated.ScrollView
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.measure}>
        <Pressable
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
          onPress={() => router.back()}
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
          {regions.map((r, i) => {
            const heroImage = getHeroImage(r.id);
            const c = cardTextColors(palette, !!heroImage);
            return (
              <BackgroundCard
                key={r.id}
                {...(heroImage ? { heroImage } : {})}
                minHeight={180}
                onPress={() => {
                  haptics.medium();
                  router.push({ pathname: "/[tomeId]", params: { tomeId: r.id } });
                }}
                accessibilityLabel={`Open ${r.overview.title}`}
              >
                <Text style={[styles.tileIndex, { color: c.kicker }]}>
                  {String(i + 1).padStart(2, "0")}
                </Text>
                <Text style={[styles.tileTitle, { color: c.title }]}>{r.overview.title}</Text>
                {r.overview.subTitle ? (
                  <Text style={[styles.tileSub, { color: c.subtitle }]} numberOfLines={2}>
                    {r.overview.subTitle}
                  </Text>
                ) : null}
                <Text style={[styles.tileOpen, { color: c.muted }]}>read →</Text>
              </BackgroundCard>
            );
          })}
        </View>
        </View>
      </Animated.ScrollView>
    </ScreenFrame>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    content: { padding: space.xl, paddingBottom: space.giant, paddingTop: space.huge, alignItems: "center" },
    measure: { width: "100%", maxWidth: 760, gap: space.xl },
    back: { paddingVertical: space.xs, alignSelf: "flex-start" },
    backPressed: { opacity: 0.45 },
    backLabel: { ...type.label, color: palette.textMuted },
    header: { gap: space.sm },
    kicker: { ...type.label, color: palette.textMuted },
    title: { ...type.hero, color: palette.textPrimary },
    lede: { ...type.bodyLg, color: palette.textSecondary, marginTop: space.xs },
    grid: { gap: space.md, marginTop: space.lg },
    tileIndex: { ...type.label },
    tileTitle: { ...type.title, fontSize: 22, lineHeight: 26 },
    tileSub: { ...type.body, fontSize: 14, lineHeight: 20 },
    tileOpen: { ...type.label, marginTop: space.xs },
  });
