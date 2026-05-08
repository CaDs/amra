import { Image, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";

import { onImage, space } from "../../theme/tokens";
import { useHaptics } from "../../hooks/useHaptics";

const logoMark = require("../../../assets/images/logo-mark.png");

export function HamburgerButton() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const haptics = useHaptics();

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
        <Image source={logoMark} style={styles.logo} resizeMode="contain" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: onImage.bgSurface,
    borderWidth: 1,
    borderColor: onImage.borderEmphasis,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.55,
  },
  logo: {
    width: 24,
    height: 24,
  },
});
