import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { space, type, fonts, type Palette } from "../../theme/tokens";
import { useTheme } from "../../theme/useTheme";

type Props = {
  markdown: string;
};

export function LoreBody({ markdown }: Props) {
  const { palette } = useTheme();
  const styles = useMemo(() => makeMarkdownStyles(palette), [palette]);

  return (
    <View style={containerStyle}>
      <Markdown style={styles} mergeStyle={false}>
        {markdown}
      </Markdown>
    </View>
  );
}

const containerStyle = {
  width: "100%" as const,
};

const makeMarkdownStyles = (palette: Palette) =>
  StyleSheet.create({
    body: {
      ...type.bodyLg,
      color: palette.textPrimary,
    },
    paragraph: {
      ...type.bodyLg,
      color: palette.textPrimary,
      marginTop: 0,
      marginBottom: space.md,
    },
    heading1: {
      fontFamily: fonts.sansSemi,
      fontSize: 28,
      lineHeight: 34,
      color: palette.textPrimary,
      marginTop: space.xxl,
      marginBottom: space.md,
    },
    heading2: {
      ...type.label,
      color: palette.textMuted,
      marginTop: space.xxl,
      marginBottom: space.md,
      textTransform: "uppercase",
    },
    heading3: {
      ...type.title,
      color: palette.textPrimary,
      marginTop: space.xl,
      marginBottom: space.sm,
    },
    heading4: {
      fontFamily: fonts.sansSemi,
      fontSize: 18,
      lineHeight: 24,
      letterSpacing: -0.2,
      color: palette.dener,
      marginTop: space.lg,
      marginBottom: space.xs,
    },
    heading5: {
      ...type.label,
      color: palette.dener,
      marginTop: space.md,
      marginBottom: space.xxs,
      textTransform: "uppercase",
    },
    heading6: {
      ...type.label,
      color: palette.textMuted,
      marginTop: space.md,
      marginBottom: space.xxs,
      textTransform: "uppercase",
    },
    strong: {
      fontFamily: fonts.sansSemi,
      color: palette.iothas,
    },
    em: {
      fontStyle: "italic",
      color: palette.textSecondary,
    },
    s: {
      textDecorationLine: "line-through",
      color: palette.textMuted,
    },
    bullet_list: {
      marginBottom: space.md,
    },
    ordered_list: {
      marginBottom: space.md,
    },
    list_item: {
      ...type.bodyLg,
      color: palette.textPrimary,
      marginBottom: space.xs,
    },
    bullet_list_icon: {
      color: palette.dener,
      marginRight: space.sm,
      lineHeight: 28,
    },
    bullet_list_content: {
      flex: 1,
    },
    ordered_list_icon: {
      color: palette.dener,
      marginRight: space.sm,
      lineHeight: 28,
      fontFamily: fonts.mono,
    },
    ordered_list_content: {
      flex: 1,
    },
    blockquote: {
      borderLeftWidth: 2,
      borderLeftColor: palette.dener,
      paddingLeft: space.md,
      marginVertical: space.md,
    },
    code_inline: {
      fontFamily: fonts.mono,
      fontSize: 14,
      color: palette.iothas,
      backgroundColor: palette.bgSurface,
      paddingHorizontal: space.xxs,
      borderRadius: 3,
    },
    hr: {
      backgroundColor: palette.borderSubtle,
      height: 1,
      marginVertical: space.xl,
    },
    link: {
      color: palette.dener,
    },
    // Images are disabled — we render nothing for them; intentionally empty
    // style entries keep types happy if any image markup slips through.
    image: { width: 0, height: 0 },
  });
