import React from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import type { Theme } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

export type BevelVariant = "out" | "in" | "frame";

/**
 * Only the properties the bevel sets. `TextStyle` narrows some of `ViewStyle`'s fields, so a
 * plain `ViewStyle` return type cannot be spread onto a `TextInput`; this shape can.
 */
export type BevelStyle = Pick<
  ViewStyle,
  | "borderWidth"
  | "borderRadius"
  | "borderTopColor"
  | "borderLeftColor"
  | "borderBottomColor"
  | "borderRightColor"
  | "backgroundColor"
  | "shadowColor"
  | "shadowOffset"
  | "shadowOpacity"
  | "shadowRadius"
  | "elevation"
>;

/** Per-side border colours that make the classic raised / sunken / window-frame look. */
export function bevelStyle(t: Theme, variant: BevelVariant): BevelStyle {
  const c = t.color;
  const common: BevelStyle = { borderWidth: t.metric.bevel, borderRadius: t.metric.radius };
  if (variant === "in") {
    return {
      ...common,
      borderTopColor: c.dark,
      borderLeftColor: c.dark,
      borderBottomColor: c.light,
      borderRightColor: c.light,
      backgroundColor: c.paper,
    };
  }
  if (variant === "frame") {
    return {
      ...common,
      borderTopColor: c.light,
      borderLeftColor: c.light,
      borderBottomColor: c.darker,
      borderRightColor: c.darker,
      backgroundColor: c.face,
      shadowColor: c.darker,
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    };
  }
  return {
    ...common,
    borderTopColor: c.light,
    borderLeftColor: c.light,
    borderBottomColor: c.dark,
    borderRightColor: c.dark,
    backgroundColor: c.face,
  };
}

export function Bevel({ variant, style, ...rest }: ViewProps & { variant: BevelVariant }) {
  const t = useTheme();
  return <View style={[bevelStyle(t, variant), style]} {...rest} />;
}
