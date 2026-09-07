import React from "react";
import { View } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { bevelStyle } from "./Bevel";

const SEGMENTS = 20;

/** The classic segmented progress control: discrete blocks, not a smooth fill. */
export function Progress({ value, max }: { value: number; max: number }) {
  const t = useTheme();
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const filled = Math.round(pct * SEGMENTS);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ now: value, min: 0, max }}
      style={[bevelStyle(t, "in"), { height: 18, flexDirection: "row", padding: 2, gap: 2 }]}
    >
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <View
          key={i}
          style={{ flex: 1, backgroundColor: i < filled ? t.color.progress : "transparent" }}
        />
      ))}
    </View>
  );
}
