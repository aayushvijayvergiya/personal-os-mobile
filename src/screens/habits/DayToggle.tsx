import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { Txt, bevelStyle } from "@/ui";

/**
 * One day cell in the habit week. The whole column is the tap target so the box itself can stay
 * small, which keeps seven of them comfortable on a narrow phone.
 */
export function DayToggle({
  checked,
  disabled,
  highlight,
  label,
  onPress,
}: {
  checked: boolean;
  disabled?: boolean;
  highlight?: boolean;
  label: string;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !!disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={{
        flex: 1,
        height: 46,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: highlight ? t.color.paperTint : "transparent",
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <View
        style={[
          bevelStyle(t, "in"),
          {
            width: 30,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: checked ? t.color.progress : t.color.paper,
          },
        ]}
      >
        {checked ? (
          <Txt style={{ fontSize: 17, lineHeight: 21, color: t.color.highlightText }}>✓</Txt>
        ) : null}
      </View>
    </Pressable>
  );
}
