import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { bevelStyle } from "./Bevel";
import { Txt } from "./Txt";

export function Check({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !!disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={{ flexDirection: "row", alignItems: "center", gap: 8, minHeight: t.metric.tap, opacity: disabled ? 0.5 : 1 }}
    >
      <View
        style={[
          bevelStyle(t, "in"),
          { width: 22, height: 22, alignItems: "center", justifyContent: "center", backgroundColor: t.color.paper },
        ]}
      >
        {checked ? <Txt variant="bold" style={{ fontSize: 15, lineHeight: 18 }}>✓</Txt> : null}
      </View>
      {label ? <Txt style={{ flexShrink: 1 }}>{label}</Txt> : null}
    </Pressable>
  );
}
