import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useNavigation, useRouter } from "expo-router";
import { useResponsive } from "../../hooks/useResponsive";
import { space, type, type Palette } from "../../theme/tokens";
import { useTheme } from "../../theme/useTheme";
import { useHaptics } from "../../hooks/useHaptics";
import type { Tome } from "../../types/lore";
import { Callouts } from "./Callouts";
import { DetailHero } from "./DetailHero";
import { PullQuoteSplash } from "./PullQuoteSplash";
import { SectionLayout } from "./SectionLayout";
import { Hairline } from "../primitives/Hairline";
import { IndexStrip } from "./IndexStrip";
import { SectionNav, type Section } from "./SectionNav";

type Props = {
  tome: Tome;
};

export function DetailScroll({ tome }: Props) {
  const router = useRouter();
  const navigation = useNavigation();
  const { palette } = useTheme();
  const haptics = useHaptics();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { height, isPhone } = useResponsive();
  const scrollY = useSharedValue(0);
  const animatedRef = useAnimatedRef<Animated.ScrollView>();

  const [sectionOffsets, setSectionOffsets] = useState<Record<string, number>>({});
  const onSectionLayout = useCallback(
    (id: string) => (e: LayoutChangeEvent) => {
      const y = e.nativeEvent.layout.y;
      setSectionOffsets((prev) => (prev[id] === y ? prev : { ...prev, [id]: y }));
    },
    [],
  );

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const hapticsRef = useRef(haptics);
  hapticsRef.current = haptics;
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

  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove" as never, () => {
      hapticsRef.current.light();
    });
    return unsub;
  }, [navigation]);

  const heroHeight = Math.min(height * 0.7, 620);
  const splashHeight = 280;

  const hasFacts = !!(tome.overview.callouts && tome.overview.callouts.length > 0);
  const hasHistory = !!tome.overview.history;
  const hasConstruction = !!tome.overview.construction;
  const hasLocation = !!tome.overview.location;
  const hasPullQuote = !!tome.overview.pullQuote;
  const indexEntries = useMemo(() => {
    const titles = new Set(tome.subEntries.map((e) => e.title));
    return tome.subEntries.filter((e) => !e.group || !titles.has(e.group));
  }, [tome.subEntries]);
  const hasSubEntries = indexEntries.length > 0;

  const sections: Section[] = useMemo(() => {
    const out: Section[] = [];
    if (hasFacts && sectionOffsets.facts !== undefined) {
      out.push({ id: "facts", label: "FACTS", offsetY: sectionOffsets.facts });
    }
    if (hasHistory && sectionOffsets.history !== undefined) {
      out.push({ id: "history", label: "HISTORY", offsetY: sectionOffsets.history });
    }
    if (hasConstruction && sectionOffsets.construction !== undefined) {
      out.push({ id: "construction", label: "POWER", offsetY: sectionOffsets.construction });
    }
    if (hasLocation && sectionOffsets.location !== undefined) {
      out.push({ id: "location", label: "PLACES", offsetY: sectionOffsets.location });
    }
    if (hasSubEntries && sectionOffsets.index !== undefined) {
      out.push({ id: "index", label: "INDEX", offsetY: sectionOffsets.index });
    }
    return out;
  }, [hasConstruction, hasFacts, hasHistory, hasLocation, hasSubEntries, sectionOffsets]);

  const scrollTo = useCallback(
    (offsetY: number) => {
      animatedRef.current?.scrollTo({ y: Math.max(0, offsetY - 80), animated: true });
    },
    [animatedRef],
  );

  const splashStartAt = useMemo(() => heroHeight + 60 + 800, [heroHeight]);

  const kicker = tome.kind === "region" ? "REGION" : `CHAPTER ${tome.order.toString().padStart(2, "0")}`;
  const overview = tome.overview;

  return (
    <View style={styles.root}>
      <Pressable
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <Text style={styles.backLabel}>← back</Text>
      </Pressable>

      <Animated.ScrollView
        ref={animatedRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.measure}>
        <DetailHero
          title={overview.title}
          {...(overview.subTitle !== undefined ? { subTitle: overview.subTitle } : {})}
          kicker={kicker}
          scrollY={scrollY}
          height={heroHeight}
        />

        {hasFacts ? (
          <View onLayout={onSectionLayout("facts")}>
            <SectionLayout label="FACTS" body={<Callouts callouts={overview.callouts!} />} />
          </View>
        ) : null}

        {hasHistory ? (
          <View onLayout={onSectionLayout("history")}>
            <SectionLayout
              label="HISTORY"
              title={tome.kind === "region" ? "Origins" : "Account"}
              body={
                <View style={styles.proseBlock}>
                  {overview.history!.map((p, i) => (
                    <Text key={i} style={styles.prose}>
                      {p}
                    </Text>
                  ))}
                </View>
              }
            />
          </View>
        ) : null}

        {hasConstruction ? (
          <View onLayout={onSectionLayout("construction")}>
            <SectionLayout
              label="POWER & PEOPLE"
              title="Houses and figures"
              body={
                <View style={styles.proseBlock}>
                  {overview.construction!.map((p, i) => (
                    <Text key={i} style={styles.prose}>
                      {p}
                    </Text>
                  ))}
                </View>
              }
            />
          </View>
        ) : null}

        {hasLocation ? (
          <View onLayout={onSectionLayout("location")}>
            <SectionLayout
              label="PLACES"
              title="Where the realm lives"
              body={
                <View style={styles.proseBlock}>
                  {overview.location!.map((p, i) => (
                    <Text key={i} style={styles.prose}>
                      {p}
                    </Text>
                  ))}
                </View>
              }
            />
          </View>
        ) : null}

        <View style={styles.dividerWrap}>
          <Hairline width={120} />
        </View>

        {hasPullQuote ? (
          <PullQuoteSplash
            pullQuote={overview.pullQuote!}
            scrollY={scrollY}
            startAt={splashStartAt}
            height={splashHeight}
          />
        ) : null}

        {hasSubEntries ? (
          <View onLayout={onSectionLayout("index")}>
            <IndexStrip
              tomeId={tome.id}
              subEntries={indexEntries}
              label={tome.kind === "region" ? "WITHIN THE REGION" : "WITHIN THE CHAPTER"}
            />
          </View>
        ) : null}

        <View style={styles.footer}>
          <Hairline width={48} />
          <Text style={styles.footerLabel}>END · {tome.kind === "region" ? "REGION" : "CHAPTER"}</Text>
        </View>
        </View>
      </Animated.ScrollView>

      {!isPhone || sections.length > 0 ? (
        <SectionNav sections={sections} scrollY={scrollY} onTap={scrollTo} />
      ) : null}
    </View>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: palette.bg,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingBottom: space.giant,
      alignItems: "center",
    },
    measure: {
      width: "100%",
      maxWidth: 760,
    },
    backButton: {
      position: "absolute",
      top: space.huge,
      left: space.lg,
      zIndex: 5,
      paddingHorizontal: space.md,
      paddingVertical: space.xs,
    },
    backButtonPressed: {
      opacity: 0.45,
    },
    backLabel: {
      ...type.label,
      color: palette.textMuted,
    },
    proseBlock: {
      gap: space.md,
    },
    prose: {
      ...type.bodyLg,
      color: palette.textPrimary,
    },
    dividerWrap: {
      paddingVertical: space.xxl,
      alignItems: "center",
    },
    footer: {
      alignItems: "center",
      paddingVertical: space.giant,
      gap: space.md,
    },
    footerLabel: {
      ...type.label,
      color: palette.textFaint,
    },
  });
