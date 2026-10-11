import React from "react";
import { View } from "react-native";
import { ALL_DAYS, WEEKDAY_LABELS } from "@/lib/recurrence";
import { Btn } from "./Btn";
import { Chip } from "./Chip";

/** Mon–Sun toggle chips; `presets` adds Daily / Weekdays / Weekends shortcuts. May emit an empty set. */
export function WeekdayPicker({
  value,
  onChange,
  presets = false,
}: {
  value: number[];
  onChange: (days: number[]) => void;
  presets?: boolean;
}) {
  const toggle = (d: number) =>
    onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d].sort((a, b) => a - b));
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
        {WEEKDAY_LABELS.map((label, d) => (
          <Chip key={d} label={label} active={value.includes(d)} onPress={() => toggle(d)} />
        ))}
      </View>
      {presets ? (
        <View style={{ flexDirection: "row", gap: 6 }}>
          <Btn small onPress={() => onChange(ALL_DAYS)}>Daily</Btn>
          <Btn small onPress={() => onChange([0, 1, 2, 3, 4])}>Weekdays</Btn>
          <Btn small onPress={() => onChange([5, 6])}>Weekends</Btn>
        </View>
      ) : null}
    </View>
  );
}
