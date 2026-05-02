import { useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useNavigation, useRouter } from "expo-router";
import { space, type, type Palette } from "../../theme/tokens";
import { useTheme } from "../../theme/useTheme";
import { useHaptics } from "../../hooks/useHaptics";
import type { Entry, Tome } from "../../types/lore";
import { Hairline } from "../primitives/Hairline";
import { Callouts } from "./Callouts";
import { PullQuoteSplash } from "./PullQuoteSplash";
import { IndexStrip } from "./IndexStrip";
import { useResponsive } from "../../hooks/useResponsive";

type Props = {
  entry: Entry;
  tome: Tome;
  index: number;
};

export function SubEntryView({ entry, tome, index }: Props) {
  const router = useRouter();
  const navigation = useNavigation();
  const { palette } = useTheme();
  const haptics = useHaptics();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { height } = useResponsive();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const hapticsRef = useRef(haptics);
  hapticsRef.current = haptics;
  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove" as never, () => {
      hapticsRef.current.light();
    });
    return unsub;
  }, [navigation]);

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

  const children = useMemo(
    () => tome.subEntries.filter((e) => e.group === entry.title),
    [tome.subEntries, entry.title],
  );
  const heroH = Math.min(height * 0.55, 480);
  const heroAnim = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, heroH], [1, 0.3], Extrapolation.CLAMP);
    const ty = interpolate(scrollY.value, [0, heroH], [0, -heroH * 0.25], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY: ty }] };
  });

  return (
    <View style={styles.root}>
      <Pressable
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={`Back to ${tome.overview.title}`}
      >
        <Text style={styles.backLabel}>← {tome.overview.title.toLowerCase()}</Text>
      </Pressable>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.measure}>
        <View style={[styles.heroOuter, { height: heroH, pointerEvents: "none" }]}>
          <Animated.View style={[styles.heroInner, heroAnim]}>
            <Text style={styles.kicker}>
              {tome.overview.title.toUpperCase()} · {String(index + 1).padStart(2, "0")}
            </Text>
            <Text style={styles.title}>{entry.title}</Text>
            {entry.subTitle ? <Text style={styles.subtitle}>{entry.subTitle.toLowerCase()}</Text> : null}
            <Hairline width={56} style={{ marginTop: space.lg, backgroundColor: palette.dener }} />
          </Animated.View>
        </View>

        {entry.callouts && entry.callouts.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>FACTS</Text>
            <Callouts callouts={entry.callouts} />
          </View>
        ) : null}

        {entry.history ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ACCOUNT</Text>
            {entry.history.map((p, i) => (
              <Text key={i} style={styles.prose}>
                {p}
              </Text>
            ))}
          </View>
        ) : null}

        {entry.construction ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>POWER & PEOPLE</Text>
            {entry.construction.map((p, i) => (
              <Text key={i} style={styles.prose}>
                {p}
              </Text>
            ))}
          </View>
        ) : null}

        {entry.location ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PLACES</Text>
            {entry.location.map((p, i) => (
              <Text key={i} style={styles.prose}>
                {p}
              </Text>
            ))}
          </View>
        ) : null}

        {entry.pullQuote ? (
          <PullQuoteSplash pullQuote={entry.pullQuote} scrollY={scrollY} startAt={heroH + 600} height={240} />
        ) : null}

        {children.length > 0 ? (
          <IndexStrip
            tomeId={tome.id}
            subEntries={children}
            label={`WITHIN ${entry.title.toUpperCase()}`}
          />
        ) : null}

        <View style={styles.footer}>
          <Hairline width={48} />
          <Text style={styles.footerLabel}>END · ENTRY</Text>
        </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: palette.bg },
    scroll: { flex: 1 },
    content: { paddingBottom: space.giant, alignItems: "center" },
    measure: { width: "100%", maxWidth: 760 },
    backButton: {
      position: "absolute",
      top: space.huge,
      left: space.lg,
      zIndex: 5,
      paddingHorizontal: space.md,
      paddingVertical: space.xs,
    },
    backButtonPressed: { opacity: 0.45 },
    backLabel: { ...type.label, color: palette.textMuted },
    heroOuter: {
      width: "100%",
      alignItems: "flex-start",
      justifyContent: "flex-end",
      paddingHorizontal: space.xl,
      paddingBottom: space.huge,
    },
    heroInner: { alignItems: "flex-start", gap: space.xs },
    kicker: { ...type.label, color: palette.textMuted, marginBottom: space.sm },
    title: { ...type.hero, color: palette.textPrimary },
    subtitle: { ...type.subtitle, color: palette.textSecondary, marginTop: space.xs },
    section: {
      paddingHorizontal: space.xl,
      paddingVertical: space.xxl,
      gap: space.md,
    },
    sectionLabel: { ...type.label, color: palette.textMuted },
    prose: { ...type.bodyLg, color: palette.textPrimary },
    footer: { alignItems: "center", paddingVertical: space.giant, gap: space.md },
    footerLabel: { ...type.label, color: palette.textFaint },
  });
