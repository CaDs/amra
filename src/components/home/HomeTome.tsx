import { useCallback, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme/useTheme";
import { useHaptics } from "../../hooks/useHaptics";
import type { HomeSpread as HomeSpreadData } from "../../types/lore";
import { HeroSpread } from "./HeroSpread";
import { PageIndicator } from "./PageIndicator";

type Props = {
  spreads: HomeSpreadData[];
};

export function HomeTome({ spreads }: Props) {
  const router = useRouter();
  const { palette } = useTheme();
  const haptics = useHaptics();
  const [pageHeight, setPageHeight] = useState<number | null>(null);
  const scrollY = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const lastPageRef = useRef(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!pageHeight) return;
      const newPage = Math.round(e.nativeEvent.contentOffset.y / pageHeight);
      if (newPage !== lastPageRef.current) {
        lastPageRef.current = newPage;
        haptics.selection();
      }
    },
    [pageHeight, haptics],
  );

  const handleOpen = useCallback(
    (spread: HomeSpreadData) => {
      if (spread.routeGazetteer) {
        router.push("/gazetteer");
      } else if (spread.routeTomeId) {
        router.push({ pathname: "/[tomeId]", params: { tomeId: spread.routeTomeId } });
      }
    },
    [router],
  );

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setPageHeight((prev) => (prev === h ? prev : h));
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]} onLayout={onLayout}>
      {pageHeight !== null && (
        <>
          <Animated.ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={{ height: pageHeight * spreads.length }}
            showsVerticalScrollIndicator={false}
            pagingEnabled
            snapToInterval={pageHeight}
            decelerationRate="fast"
            onScroll={onScroll}
            onMomentumScrollEnd={onMomentumScrollEnd}
            scrollEventThrottle={16}
          >
            {spreads.map((spread, i) => (
              <HeroSpread
                key={spread.id}
                spread={spread}
                index={i}
                total={spreads.length}
                scrollY={scrollY}
                pageHeight={pageHeight}
                onOpen={() => handleOpen(spread)}
              />
            ))}
          </Animated.ScrollView>

          <PageIndicator total={spreads.length} pageHeight={pageHeight} scrollY={scrollY} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
});
