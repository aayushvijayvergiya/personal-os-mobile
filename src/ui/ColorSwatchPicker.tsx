import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { bevelStyle } from "./Bevel";

/** The fixed retro palette used for project colours and goal categories. */
export const SWATCHES = [
  "#000080",
  "#1084d0",
  "#008080",
  "#008000",
  "#808000",
  "#800000",
  "#aa0000",
  "#800080",
  "#ff8c00",
  "#404040",
  "#808080",
  "#c0c0c0",
];

export function ColorSwatchPicker({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {SWATCHES.map((hex) => {
        const on = hex.toLowerCase() === value?.toLowerCase();
        return (
          <Pressable
            key={hex}
            accessibilityRole="button"
            accessibilityLabel={`Colour ${hex}`}
            accessibilityState={{ selected: on }}
            onPress={() => onChange(hex)}
            hitSlop={6}
            style={[
              bevelStyle(t, on ? "in" : "out"),
              { width: 40, height: 32, alignItems: "center", justifyContent: "center" },
            ]}
          >
            <View style={{ width: 26, height: 18, backgroundColor: hex, borderWidth: 1, borderColor: t.color.darker }} />
          </Pressable>
        );
      })}
    </View>
  );
}
