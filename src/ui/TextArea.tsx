import React from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { bevelStyle } from "./Bevel";
import { Txt } from "./Txt";

const LINE = 20;

export function TextArea({
  label,
  rows = 3,
  style,
  ...rest
}: TextInputProps & { label?: string; rows?: number }) {
  const t = useTheme();
  return (
    <View style={{ gap: 4 }}>
      {label ? <Txt variant="small">{label}</Txt> : null}
      <TextInput
        multiline
        textAlignVertical="top"
        placeholderTextColor={t.color.textMuted}
        keyboardAppearance={t.dark ? "dark" : "light"}
        style={[
          bevelStyle(t, "in"),
          {
            minHeight: rows * LINE + 16,
            paddingHorizontal: 8,
            paddingVertical: 8,
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
