import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ScreenFrame } from "../../src/components/primitives/ScreenFrame";
import { SubEntryView } from "../../src/components/detail/SubEntryView";
import { getTome } from "../../src/data/loadLore";
import { space, type, type Palette } from "../../src/theme/tokens";
import { useTheme } from "../../src/theme/useTheme";

export default function EntryRoute() {
  const { tomeId, entryId } = useLocalSearchParams<{ tomeId: string; entryId: string }>();
  const tome = tomeId ? getTome(tomeId) : undefined;
  const idx = tome?.subEntries.findIndex((e) => e.id === entryId) ?? -1;
  const entry = tome && idx >= 0 ? tome.subEntries[idx] : undefined;
  const { palette } = useTheme();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  if (!tome || !entry) {
    return (
      <ScreenFrame>
        <View style={styles.empty}>
          <Text style={styles.title}>Entry not found</Text>
          <Text style={styles.body}>
            {tomeId} / {entryId}
          </Text>
        </View>
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame>
      <SubEntryView entry={entry} tome={tome} index={idx} />
    </ScreenFrame>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: space.xl, gap: space.md },
    title: { ...type.hero, color: palette.textPrimary, textAlign: "center" },
    body: { ...type.body, color: palette.textMuted, textAlign: "center" },
  });
