import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";

import { space, type as typeTokens, type Palette } from "../../theme/tokens";
import { useTheme } from "../../theme/useTheme";
import { useHaptics } from "../../hooks/useHaptics";
import { Hairline } from "../primitives/Hairline";
import { specForRoute } from "./tabConfig";

export function DrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const haptics = useHaptics();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { state, navigation } = props;

  return (
    <View style={[styles.root, { paddingTop: insets.top + space.lg }]}>
      <View style={styles.header}>
        <Text style={styles.brand}>Amra</Text>
        <Text style={styles.tagline}>a world compendium</Text>
      </View>

      <Hairline width={56} style={styles.rule} />

      <View style={styles.list}>
        {state.routes.map((route, index) => {
          const spec = specForRoute(route.name);
          if (!spec) return null;
          const focused = state.index === index;

          const onPress = () => {
            if (focused) {
              navigation.closeDrawer();
              return;
            }
            haptics.selection();
            navigation.navigate(route.name, route.params);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [
                styles.item,
                focused && styles.itemActive,
                pressed && styles.itemPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={spec.label}
              accessibilityState={{ selected: focused }}
            >
              <Ionicons
                name={focused ? spec.iconActive : spec.iconInactive}
                size={20}
                color={focused ? palette.iothas : palette.textSecondary}
              />
              <Text style={[styles.label, focused && styles.labelActive]}>
                {spec.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: palette.bg,
      paddingHorizontal: space.xl,
    },
    header: {
      gap: space.xxs,
      paddingTop: space.md,
    },
    brand: {
      ...typeTokens.display,
      fontSize: 36,
      lineHeight: 40,
      color: palette.textPrimary,
    },
    tagline: {
      ...typeTokens.label,
      color: palette.textMuted,
    },
    rule: {
      backgroundColor: palette.iothas,
      marginVertical: space.lg,
    },
    list: {
      flex: 1,
      gap: space.xs,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: space.md,
      paddingVertical: space.md,
      paddingHorizontal: space.md,
      borderRadius: 8,
    },
    itemActive: {
      backgroundColor: palette.bgSurface,
    },
    itemPressed: {
      opacity: 0.6,
    },
    label: {
      ...typeTokens.bodyLg,
      color: palette.textSecondary,
    },
    labelActive: {
      color: palette.textPrimary,
    },
    footer: {
      paddingTop: space.lg,
    },
    footerLabel: {
      ...typeTokens.label,
      color: palette.textFaint,
    },
  });
