import React from "react";
import { Text, type TextProps, type TextStyle } from "react-native";
import { useTheme } from "@/theme/useTheme";

export type TxtVariant = "body" | "small" | "bold" | "title" | "muted" | "danger" | "link";

/**
 * Every string in the app renders through this so the theme's font and colours apply everywhere.
 * Bold swaps the font *file* rather than setting fontWeight, because the bundled face is a pixel
 * font and faux-bold smears it.
 */
export function Txt({ variant = "body", style, ...rest }: TextProps & { variant?: TxtVariant }) {
  const t = useTheme();
  const hasBoldFace = !!t.font.bold;
  const bold: TextStyle = hasBoldFace
    ? { fontFamily: t.font.bold }
    : { fontWeight: "bold" };

  const base: TextStyle = { color: t.color.text, fontSize: t.metric.font, fontFamily: t.font.family };
  const v: TextStyle =
    variant === "small"
      ? { fontSize: t.metric.fontSmall }
      : variant === "bold"
        ? bold
        : variant === "title"
          ? { ...bold, fontSize: t.metric.titleFont, color: t.color.titleText }
          : variant === "muted"
            ? { color: t.color.textMuted }
            : variant === "danger"
              ? { ...bold, color: t.color.danger }
              : variant === "link"
                ? { color: t.color.link, textDecorationLine: "underline" }
                : {};
  return <Text style={[base, v, style]} {...rest} />;
}
