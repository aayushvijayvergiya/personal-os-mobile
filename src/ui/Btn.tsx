import React from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { bevelStyle } from "./Bevel";
import { Txt } from "./Txt";

export function Btn({
  primary,
  small,
  disabled,
  children,
  style,
  ...rest
}: Omit<PressableProps, "style" | "children"> & {
  primary?: boolean;
  small?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={small ? 8 : 0}
      style={({ pressed }) => [
        bevelStyle(t, pressed ? "in" : "out"),
        {
          backgroundColor: t.color.face,
          minHeight: small ? 28 : t.metric.tap,
          paddingHorizontal: small ? 8 : 14,
          alignItems: "center",
          justifyContent: "center",
          ...(primary ? { outlineWidth: 1, outlineColor: t.color.text, outlineStyle: "solid" } : {}),
        },
        style,
      ]}
      {...rest}
    >
      {typeof children === "string" ? (
        <Txt
          variant={primary ? "bold" : "body"}
          style={[
            small ? { fontSize: t.metric.fontSmall } : null,
            disabled ? { color: t.color.dark, textShadowColor: t.color.light, textShadowOffset: { width: 1, height: 1 } } : null,
          ]}
        >
          {children}
        </Txt>
      ) : (
        children
      )}
    </Pressable>
  );
}
