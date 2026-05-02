import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";

import { space, type Palette } from "../../theme/tokens";
import { useTheme } from "../../theme/useTheme";
import { useHaptics } from "../../hooks/useHaptics";

export function HamburgerButton() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { palette } = useTheme();
  const haptics = useHaptics();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  const onPress = () => {
    haptics.light();
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={[styles.wrap, { top: insets.top + space.xs }]} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
      >
        <Ionicons name="menu" size={24} color={palette.textPrimary} />
      </Pressable>
    </View>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    wrap: {
      position: "absolute",
      left: space.lg,
      zIndex: 50,
    },
    button: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
      backgroundColor: palette.bgSurface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.borderSubtle,
    },
    buttonPressed: {
      opacity: 0.55,
    },
  });
