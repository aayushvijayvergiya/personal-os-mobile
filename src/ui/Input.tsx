import React, { useRef } from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { bevelStyle } from "./Bevel";
import { useKeyboardScroll } from "./KeyboardScroll";
import { Txt } from "./Txt";

export function Input({ label, style, onFocus, ...rest }: TextInputProps & { label?: string }) {
  const t = useTheme();
  const inputRef = useRef<TextInput>(null);
  const scrollToInput = useKeyboardScroll();
  return (
    <View style={{ gap: 4 }}>
      {label ? <Txt variant="small">{label}</Txt> : null}
      <TextInput
        ref={inputRef}
        onFocus={(e) => {
          onFocus?.(e);
          scrollToInput(inputRef.current);
        }}
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
