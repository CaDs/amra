import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "../../theme/useTheme";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

export function ScreenFrame({ children, style }: Props) {
  const { palette } = useTheme();
  return <View style={[styles.frame, { backgroundColor: palette.bg }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
  },
});
