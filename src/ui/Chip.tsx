import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { bevelStyle } from "./Bevel";
import { Txt } from "./Txt";

/** Small toggle pill: habit chips, category and horizon filters, calendar banners. */
export function Chip({
  label,
  active,
  onPress,
  color,
  count,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  /** Optional swatch shown before the label (category colour). */
  color?: string;
  count?: number;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      accessibilityLabel={label}
      disabled={!onPress}
      onPress={onPress}
      style={[
        bevelStyle(t, active ? "in" : "out"),
        {
          minHeight: 32,
          paddingHorizontal: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          backgroundColor: active ? t.color.paperTint : t.color.face,
        },
      ]}
    >
      {color ? (
        <View style={{ width: 10, height: 10, backgroundColor: color, borderWidth: 1, borderColor: t.color.darker }} />
      ) : null}
      <Txt variant={active ? "bold" : "body"} style={{ fontSize: t.metric.fontSmall }}>
        {label}
      </Txt>
      {count != null ? (
        <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
          {count}
        </Txt>
      ) : null}
    </Pressable>
  );
}
