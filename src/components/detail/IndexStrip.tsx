import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { space, type, type Palette } from "../../theme/tokens";
import { useTheme } from "../../theme/useTheme";
import { useHaptics } from "../../hooks/useHaptics";
import type { Entry } from "../../types/lore";
import { useResponsive } from "../../hooks/useResponsive";

type Props = {
  tomeId: string;
  subEntries: Entry[];
  label: string;
};

export function IndexStrip({ tomeId, subEntries, label }: Props) {
  const router = useRouter();
  const { palette } = useTheme();
  const haptics = useHaptics();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { isPhone } = useResponsive();

  const onPress = (entryId: string) => {
    haptics.medium();
    router.push({
      pathname: "/[tomeId]/[entryId]",
      params: { tomeId, entryId },
    });
  };

  return (
    <View style={styles.outer}>
      <View style={styles.heading}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.count}>· {subEntries.length}</Text>
      </View>
      <FlatList
        horizontal
        data={subEntries}
        keyExtractor={(e) => e.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <Pressable
            style={[styles.card, isPhone ? styles.cardPhone : styles.cardWide]}
            onPress={() => onPress(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.title}`}
          >
            <Text style={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</Text>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {item.subTitle ? (
              <Text style={styles.cardSubtitle} numberOfLines={2}>
                {item.subTitle}
              </Text>
            ) : item.history?.[0] ? (
              <Text style={styles.cardSubtitle} numberOfLines={3}>
                {item.history[0].slice(0, 120)}…
              </Text>
            ) : null}
            <View style={styles.cardFooter}>
              <Text style={styles.cardOpen}>read →</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    outer: {
      paddingTop: space.giant,
      paddingBottom: space.xxl,
      gap: space.lg,
    },
    heading: {
      flexDirection: "row",
      alignItems: "center",
      gap: space.xs,
      paddingHorizontal: space.xl,
    },
    label: { ...type.label, color: palette.textMuted },
    count: { ...type.label, color: palette.textFaint },
    list: {
      paddingHorizontal: space.xl,
      gap: space.md,
    },
    card: {
      borderWidth: 1,
      borderColor: palette.borderSubtle,
      borderRadius: 8,
      padding: space.lg,
      backgroundColor: palette.bgSurface,
      gap: space.sm,
      justifyContent: "space-between",
    },
    cardPhone: {
      width: 230,
      minHeight: 200,
    },
    cardWide: {
      width: 290,
      minHeight: 220,
    },
    cardIndex: {
      ...type.label,
      color: palette.dener,
    },
    cardTitle: {
      ...type.title,
      fontSize: 19,
      lineHeight: 24,
      color: palette.textPrimary,
    },
    cardSubtitle: {
      ...type.body,
      color: palette.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    cardFooter: {
      marginTop: space.sm,
    },
    cardOpen: {
      ...type.label,
      color: palette.textMuted,
    },
  });
