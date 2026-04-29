import { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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

const BAR_HEIGHT = 80;
const INDICATOR_WIDTH = 64;
const INDICATOR_HEIGHT = 32;

export function AndroidMaterialTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { palette, isLight } = useTheme();
  const haptics = useHaptics();
  const styles = useMemo(() => makeStyles(palette, isLight), [palette, isLight]);

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
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
              isLight={isLight}
            />
          );
        })}
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
  isLight: boolean;
};

function TabItem({ label, iconName, focused, reduced, onPress, onLongPress, styles, palette, isLight }: TabItemProps) {
  const indicatorScaleX = useSharedValue(focused ? 1 : 0);
  const indicatorOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      indicatorScaleX.value = focused ? 1 : 0;
      indicatorOpacity.value = focused ? 1 : 0;
      return;
    }
    indicatorScaleX.value = withTiming(focused ? 1 : 0, {
      duration: duration.standard,
      easing: easing.emphasized,
    });
    indicatorOpacity.value = withTiming(focused ? 1 : 0, {
      duration: duration.fast,
      easing: easing.standard,
    });
  }, [focused, reduced, indicatorScaleX, indicatorOpacity]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ scaleX: indicatorScaleX.value }],
  }));

  const iconColor = focused ? palette.iothas : palette.textSecondary;
  const labelColor = focused ? palette.textPrimary : palette.textSecondary;

  return (
    <Pressable
      style={styles.item}
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{
        color: isLight ? "rgba(74,88,120,0.12)" : "rgba(184,196,220,0.12)",
        borderless: true,
        radius: 36,
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={focused ? { selected: true } : { selected: false }}
    >
      <View style={styles.iconWrap}>
        <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} />
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>
      <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const makeStyles = (palette: Palette, isLight: boolean) =>
  StyleSheet.create({
    bar: {
      backgroundColor: isLight ? "#ece8e0" : "#1a1c20",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.borderSubtle,
    },
    row: {
      height: BAR_HEIGHT,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: space.xs,
    },
    item: {
      flex: 1,
      height: BAR_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: space.sm,
      paddingBottom: space.xs,
      gap: space.xxs,
    },
    iconWrap: {
      width: INDICATOR_WIDTH,
      height: INDICATOR_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
    },
    indicator: {
      position: "absolute",
      width: INDICATOR_WIDTH,
      height: INDICATOR_HEIGHT,
      borderRadius: INDICATOR_HEIGHT / 2,
      backgroundColor: isLight ? "rgba(74,88,120,0.18)" : "rgba(184,196,220,0.18)",
    },
    label: {
      ...typeTokens.label,
      fontSize: 11,
      letterSpacing: 0.5,
    },
  });
