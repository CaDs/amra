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

type Bucket = { key: string; label: string; entries: Entry[] };

function bucketEntries(subEntries: Entry[], defaultLabel: string): Bucket[] {
  const buckets = new Map<string, Bucket>();
  const order: string[] = [];
  for (const entry of subEntries) {
    const label = entry.group ?? defaultLabel;
    const key = label;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { key, label, entries: [] };
      buckets.set(key, bucket);
      order.push(key);
    }
    bucket.entries.push(entry);
  }
  return order.map((key) => buckets.get(key)!);
}

export function IndexStrip({ tomeId, subEntries, label }: Props) {
  const buckets = useMemo(() => bucketEntries(subEntries, label), [subEntries, label]);
  return (
    <View style={styles.outer}>
      {buckets.map((bucket) => (
        <IndexStripGroup
          key={bucket.key}
          tomeId={tomeId}
          label={bucket.label}
          entries={bucket.entries}
        />
      ))}
    </View>
  );
}

function IndexStripGroup({
  tomeId,
  label,
  entries,
}: {
  tomeId: string;
  label: string;
  entries: Entry[];
}) {
  const router = useRouter();
  const { palette } = useTheme();
  const haptics = useHaptics();
  const groupStyles = useMemo(() => makeStyles(palette), [palette]);
  const { isPhone } = useResponsive();

  const onPress = (entryId: string) => {
    haptics.medium();
    router.push({
      pathname: "/[tomeId]/[entryId]",
      params: { tomeId, entryId },
    });
  };

  return (
    <View style={groupStyles.group}>
      <View style={groupStyles.heading}>
        <Text style={groupStyles.label}>{label.toUpperCase()}</Text>
        <Text style={groupStyles.count}>· {entries.length}</Text>
      </View>
      <FlatList
        horizontal
        data={entries}
        keyExtractor={(e) => e.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={groupStyles.list}
        renderItem={({ item, index }) => (
          <Pressable
            style={({ pressed }) => [
              groupStyles.card,
              isPhone ? groupStyles.cardPhone : groupStyles.cardWide,
              pressed && groupStyles.cardPressed,
            ]}
            onPress={() => onPress(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.title}`}
          >
            <Text style={groupStyles.cardIndex}>{String(index + 1).padStart(2, "0")}</Text>
            <Text style={groupStyles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {item.subTitle ? (
              <Text style={groupStyles.cardSubtitle} numberOfLines={2}>
                {item.subTitle}
              </Text>
            ) : item.history?.[0] ? (
              <Text style={groupStyles.cardSubtitle} numberOfLines={3}>
                {item.history[0].slice(0, 120)}…
              </Text>
            ) : null}
            <View style={groupStyles.cardFooter}>
              <Text style={groupStyles.cardOpen}>read →</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingTop: space.giant,
    paddingBottom: space.xxl,
    gap: space.xl,
  },
});

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    group: {
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
    cardPressed: {
      opacity: 0.55,
      borderColor: palette.dener,
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
