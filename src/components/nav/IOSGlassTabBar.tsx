import { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { space, type as typeTokens, type Palette } from "../../theme/tokens";
import { duration, easing } from "../../theme/motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useTheme } from "../../theme/useTheme";
import { useHaptics } from "../../hooks/useHaptics";
import { specForRoute } from "./tabConfig";

const BAR_HEIGHT = 64;
const SIDE_MARGIN = 12;
const PILL_RADIUS = 28;

export function IOSGlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { palette, isLight } = useTheme();
  const haptics = useHaptics();
  const styles = useMemo(() => makeStyles(palette, isLight), [palette, isLight]);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { paddingBottom: Math.max(insets.bottom, space.sm) + space.xs },
      ]}
    >
      <View style={styles.shadowHost}>
        <BlurView
          tint={isLight ? "systemUltraThinMaterialLight" : "systemUltraThinMaterialDark"}
          intensity={60}
          style={styles.bar}
        >
          <View style={styles.tint} pointerEvents="none" />
          <View style={styles.row}>
            {state.routes.map((route, index) => {
              const spec = specForRoute(route.name);
              if (!spec) return null;
              const focused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  haptics.selection();
                  navigation.navigate(route.name, route.params);
                }
              };

              const onLongPress = () => {
                navigation.emit({ type: "tabLongPress", target: route.key });
              };

              return (
                <TabItem
                  key={route.key}
                  label={spec.label}
                  iconName={focused ? spec.iconActive : spec.iconInactive}
                  focused={focused}
                  reduced={reduced}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  styles={styles}
                  palette={palette}
                />
              );
            })}
          </View>
          <View pointerEvents="none" style={styles.hairline} />
        </BlurView>
      </View>
    </View>
  );
}

type TabItemProps = {
  label: string;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  focused: boolean;
  reduced: boolean;
  onPress: () => void;
  onLongPress: () => void;
  styles: ReturnType<typeof makeStyles>;
  palette: Palette;
};

function TabItem({ label, iconName, focused, reduced, onPress, onLongPress, styles, palette }: TabItemProps) {
  const pillOpacity = useSharedValue(focused ? 1 : 0);
  const pillScale = useSharedValue(focused ? 1 : 0.85);

  useEffect(() => {
    if (reduced) {
      pillOpacity.value = focused ? 1 : 0;
      pillScale.value = focused ? 1 : 0.85;
      return;
    }
    pillOpacity.value = withTiming(focused ? 1 : 0, {
      duration: duration.fast,
      easing: easing.standard,
    });
    pillScale.value = withTiming(focused ? 1 : 0.85, {
      duration: duration.fast,
      easing: easing.emphasized,
    });
  }, [focused, reduced, pillOpacity, pillScale]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ scale: pillScale.value }],
  }));

  const color = focused ? palette.iothas : palette.textSecondary;

  return (
    <Pressable
      style={styles.item}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={focused ? { selected: true } : { selected: false }}
      hitSlop={8}
    >
      <Animated.View pointerEvents="none" style={[styles.pill, pillStyle]} />
      <Ionicons name={iconName} size={22} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (palette: Palette, isLight: boolean) =>
  StyleSheet.create({
    wrap: {
      position: "absolute",
      left: SIDE_MARGIN,
      right: SIDE_MARGIN,
      bottom: 0,
      alignItems: "stretch",
    },
    shadowHost: {
      borderRadius: PILL_RADIUS,
      shadowColor: "#000",
      shadowOpacity: isLight ? 0.18 : 0.45,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
    },
    bar: {
      height: BAR_HEIGHT,
      borderRadius: PILL_RADIUS,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)",
    },
    tint: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isLight ? "rgba(245,243,238,0.32)" : "rgba(14,15,18,0.32)",
    },
    row: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: space.xs,
    },
    hairline: {
      position: "absolute",
      top: 0,
      left: PILL_RADIUS,
      right: PILL_RADIUS,
      height: StyleSheet.hairlineWidth,
      backgroundColor: isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.18)",
    },
    item: {
      flex: 1,
      height: BAR_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    },
    pill: {
      position: "absolute",
      width: 56,
      height: 36,
      borderRadius: 18,
      backgroundColor: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
    },
    label: {
      ...typeTokens.label,
      fontSize: 10,
      letterSpacing: 1.2,
    },
  });
