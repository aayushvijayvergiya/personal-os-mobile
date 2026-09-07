import React from "react";
import { View } from "react-native";
import { addDays, fmt } from "@/lib/dates";
import { useTheme } from "@/theme/useTheme";

/** Seven small squares showing whether a habit was checked on each of the last 7 days. */
export function HabitDots({
  today,
  isCheckedOn,
}: {
  today: string;
  isCheckedOn: (date: string) => boolean;
}) {
  const t = useTheme();
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  return (
    <View
      accessibilityLabel={`Last seven days: ${last7.filter(isCheckedOn).length} of 7 checked`}
      style={{ flexDirection: "row", gap: 3 }}
    >
      {last7.map((date) => (
        <View
          key={date}
          accessibilityLabel={fmt(date)}
          style={{
            width: 10,
            height: 10,
            borderWidth: 1,
            borderColor: isCheckedOn(date) ? t.color.darker : t.color.dark,
            backgroundColor: isCheckedOn(date) ? t.color.progress : t.color.paper,
          }}
        />
      ))}
    </View>
  );
}
