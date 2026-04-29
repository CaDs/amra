import { ReactNode, useMemo } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useResponsive } from "../../hooks/useResponsive";
import { space, type, type Palette } from "../../theme/tokens";
import { useTheme } from "../../theme/useTheme";

type Props = {
  label: string;
  title?: string;
  body: ReactNode;
  aside?: ReactNode;
  style?: ViewStyle;
};

export function SectionLayout({ label, title, body, aside, style }: Props) {
  const { palette } = useTheme();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { isPhone } = useResponsive();
  const isWide = !isPhone;

  return (
    <View style={[styles.section, style]}>
      <Text style={styles.label}>{label}</Text>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {isWide && aside ? (
        <View style={styles.row}>
          <View style={styles.bodyCol}>{body}</View>
          <View style={styles.asideCol}>{aside}</View>
        </View>
      ) : (
        <>
          <View>{body}</View>
          {aside ? <View style={styles.asideStacked}>{aside}</View> : null}
        </>
      )}
    </View>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    section: {
      paddingHorizontal: space.xl,
      paddingVertical: space.giant,
      gap: space.lg,
    },
    label: {
      ...type.label,
      color: palette.textMuted,
    },
    title: {
      ...type.title,
      color: palette.textPrimary,
    },
    row: {
      flexDirection: "row",
      gap: space.xxl,
      alignItems: "flex-start",
    },
    bodyCol: {
      flex: 2,
    },
    asideCol: {
      flex: 1,
    },
    asideStacked: {
      marginTop: space.xl,
    },
  });
