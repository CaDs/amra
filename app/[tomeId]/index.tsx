import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ScreenFrame } from "../../src/components/primitives/ScreenFrame";
import { DetailScroll } from "../../src/components/detail/DetailScroll";
import { getTome } from "../../src/data/loadLore";
import { space, type, type Palette } from "../../src/theme/tokens";
import { useTheme } from "../../src/theme/useTheme";

export default function TomeOverviewRoute() {
  const { tomeId } = useLocalSearchParams<{ tomeId: string }>();
  const tome = tomeId ? getTome(tomeId) : undefined;
  const { palette } = useTheme();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  if (!tome) {
    return (
      <ScreenFrame>
        <View style={styles.empty}>
          <Text style={styles.title}>Unknown tome</Text>
          <Text style={styles.body}>{tomeId}</Text>
        </View>
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame>
      <DetailScroll tome={tome} />
    </ScreenFrame>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: space.xl, gap: space.md },
    title: { ...type.hero, color: palette.textPrimary, textAlign: "center" },
    body: { ...type.body, color: palette.textMuted, textAlign: "center" },
  });
