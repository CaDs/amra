import { StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "../../theme/useTheme";

type Props = {
  width?: number | "100%";
  emphasis?: "subtle" | "emphasis";
  style?: ViewStyle;
};

export function Hairline({ width = "100%", emphasis = "subtle", style }: Props) {
  const { palette } = useTheme();
  return (
    <View
      accessibilityRole="none"
      style={[
        styles.line,
        { width, backgroundColor: emphasis === "emphasis" ? palette.borderEmphasis : palette.borderSubtle },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    height: 1,
  },
});
