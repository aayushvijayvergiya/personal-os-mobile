import React from "react";
import { View } from "react-native";
import { todayISO } from "@/lib/dates";
import { weekdayIndex, withAnchor, type Recurrence } from "@/lib/recurrence";
import { useTheme } from "@/theme/useTheme";
import { Input, Select, Txt, WeekdayPicker } from "@/ui";

const FREQ_OPTS = [
  { value: "daily", label: "day(s)" },
  { value: "weekly", label: "week(s)" },
  { value: "monthly", label: "month(s)" },
];

/** "Every [N] [days|weeks|months]" plus weekday chips for weekly rules. Controlled. */
export function RecurrenceEditor({
  value,
  anchorIso,
  onChange,
}: {
  value: Recurrence;
  anchorIso: string | null;
  onChange: (r: Recurrence) => void;
}) {
  const t = useTheme();
  function changeFreq(freq: Recurrence["freq"]) {
    const interval = value.interval;
    if (freq === "daily") return onChange({ freq, interval });
    if (freq === "weekly") return onChange({ freq, interval, days: [weekdayIndex(anchorIso ?? todayISO())] });
    onChange(withAnchor({ freq, interval, day: 1 }, anchorIso ?? todayISO()));
  }
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Txt>Every</Txt>
        <View style={{ width: 64 }}>
          <Input
            accessibilityLabel="Repeat interval"
            keyboardType="number-pad"
            value={Number.isNaN(value.interval) ? "" : String(value.interval)}
            onChangeText={(s) => onChange({ ...value, interval: s.trim() === "" ? NaN : Number(s) })}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Select
            title="Repeat unit"
            value={value.freq}
            options={FREQ_OPTS}
            onChange={(f) => changeFreq(f as Recurrence["freq"])}
          />
        </View>
      </View>
      {value.freq === "weekly" ? (
        <WeekdayPicker value={value.days} onChange={(days) => onChange({ ...value, days })} />
      ) : null}
      {value.freq === "monthly" ? (
        <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
          {`on day ${value.day} (from the due date)`}
        </Txt>
      ) : null}
    </View>
  );
}
