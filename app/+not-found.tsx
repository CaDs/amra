import { useMemo } from "react";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { space, type, type Palette } from "../src/theme/tokens";
import { useTheme } from "../src/theme/useTheme";

export default function NotFound() {
  const { palette } = useTheme();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Lost in the wilds</Text>
      <Text style={styles.body}>This page does not exist in the tome.</Text>
      <Link href="/" style={styles.link}>
        Return home
      </Link>
    </View>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: palette.bg,
      alignItems: "center",
      justifyContent: "center",
      padding: space.xl,
    },
    title: { ...type.title, color: palette.textPrimary, marginBottom: space.md },
    body: { ...type.body, color: palette.textSecondary, marginBottom: space.xl, textAlign: "center" },
    link: { ...type.caption, color: palette.dener },
  });
