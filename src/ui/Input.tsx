import React from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { bevelStyle } from "./Bevel";
import { Txt } from "./Txt";

export function Input({ label, style, ...rest }: TextInputProps & { label?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 4 }}>
      {label ? <Txt variant="small">{label}</Txt> : null}
      <TextInput
        placeholderTextColor={t.color.textMuted}
        keyboardAppearance={t.dark ? "dark" : "light"}
        style={[
          bevelStyle(t, "in"),
          {
            minHeight: 40,
            paddingHorizontal: 8,
            paddingVertical: 6,
            color: t.color.text,
            fontSize: t.metric.font,
            fontFamily: t.font.family,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}
