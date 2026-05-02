import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { space, type, type Palette } from "../../theme/tokens";
import { useTheme } from "../../theme/useTheme";
import { useHaptics } from "../../hooks/useHaptics";

export type Section = { id: string; label: string; offsetY: number };

type Props = {
  sections: Section[];
  scrollY: SharedValue<number>;
  onTap: (offsetY: number) => void;
};

export function SectionNav({ sections, scrollY, onTap }: Props) {
  const { palette } = useTheme();
  const haptics = useHaptics();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  if (sections.length === 0) return null;
  return (
    <View style={[styles.rail, { pointerEvents: "box-none" }]}>
      {sections.map((section, i) => (
        <SectionDot
          key={section.id}
          index={i}
          section={section}
          sections={sections}
          scrollY={scrollY}
          onPress={() => {
            haptics.selection();
            onTap(section.offsetY);
          }}
          styles={styles}
        />
      ))}
    </View>
  );
}

function SectionDot({
  index,
  section,
  sections,
  scrollY,
  onPress,
  styles,
}: {
  index: number;
  section: Section;
  sections: Section[];
  scrollY: SharedValue<number>;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  const activeIndex = useDerivedValue(() => {
    const y = scrollY.value;
    let idx = -1;
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      if (sec && y + 120 >= sec.offsetY) idx = i;
    }
    return idx;
  });

  const dotStyle = useAnimatedStyle(() => {
    const isActive = activeIndex.value === index;
    const w = interpolate(isActive ? 1 : 0, [0, 1], [4, 16], Extrapolation.CLAMP);
    return {
      width: w,
      opacity: isActive ? 1 : 0.35,
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const isActive = activeIndex.value === index;
    return {
      opacity: isActive ? 1 : 0,
    };
  });

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Jump to ${section.label}`}>
      <View style={styles.row}>
        <Animated.Text style={[styles.label, labelStyle]} numberOfLines={1}>
          {section.label}
        </Animated.Text>
        <Animated.View style={[styles.dot, dotStyle]} />
      </View>
    </Pressable>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    rail: {
      position: "absolute",
      right: space.md,
      top: "32%",
      bottom: "32%",
      width: 140,
      alignItems: "flex-end",
      justifyContent: "center",
      gap: space.md,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: space.sm,
      height: 16,
    },
    label: {
      ...type.label,
      color: palette.textSecondary,
    },
    dot: {
      height: 2,
      backgroundColor: palette.dener,
      borderRadius: 1,
    },
  });
