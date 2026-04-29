import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { space, type, type Palette } from "../../theme/tokens";
import { duration, easing } from "../../theme/motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useTheme } from "../../theme/useTheme";

type Props = {
  callouts: string[];
};

export function Callouts({ callouts }: Props) {
  const { palette } = useTheme();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  return (
    <View style={styles.list}>
      {callouts.map((text, i) => (
        <CalloutCard key={i} text={text} index={i} />
      ))}
    </View>
  );
}

function CalloutCard({ text, index }: { text: string; index: number }) {
  const { palette } = useTheme();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const reduced = useReducedMotion();
  const v = useSharedValue(reduced ? 1 : 0);
  const accent = index % 2 === 0 ? palette.dener : palette.iothas;

  useEffect(() => {
    if (reduced) {
      v.value = 1;
      return;
    }
    v.value = withDelay(
      index * 110,
      withTiming(1, { duration: duration.standard, easing: easing.standard }),
    );
  }, [index, reduced, v]);

  const animated = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: 12 * (1 - v.value) }],
  }));

  return (
    <Animated.View style={[styles.card, animated]}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <View style={styles.body}>
        <Text style={[styles.cardLabel, { color: accent }]}>
          {String(index + 1).padStart(2, "0")} · {index % 2 === 0 ? "DENER" : "IOTHAS"}
        </Text>
        <Text style={styles.cardBody}>{text}</Text>
      </View>
    </Animated.View>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    list: {
      gap: space.md,
    },
    card: {
      flexDirection: "row",
      borderWidth: 1,
      borderColor: palette.borderSubtle,
      borderRadius: 8,
      backgroundColor: palette.bgSurface,
      overflow: "hidden",
    },
    accent: {
      width: 3,
    },
    body: {
      flex: 1,
      padding: space.lg,
      gap: space.xs,
    },
    cardLabel: {
      ...type.label,
    },
    cardBody: {
      ...type.body,
      color: palette.textPrimary,
    },
  });
