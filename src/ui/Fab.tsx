import React from "react";
import { Pressable } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { bevelStyle } from "./Bevel";
import { Txt } from "./Txt";

/**
 * Floating shortcut button, pinned bottom-right by `Screen`.
 * Styled as a raised chrome button so it still belongs to the retro UI.
 */
export function Fab({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        bevelStyle(t, pressed ? "in" : "out"),
        {
          width: 56,
          height: 56,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.color.face,
          shadowColor: t.color.darker,
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.9,
          shadowRadius: 0,
          elevation: 6,
        },
      ]}
    >
      <Txt style={{ fontSize: 26, lineHeight: 32 }}>{icon}</Txt>
    </Pressable>
  );
}
