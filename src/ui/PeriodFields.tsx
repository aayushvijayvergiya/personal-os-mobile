import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { bevelStyle } from "./Bevel";
import { Btn } from "./Btn";
import { Dialog } from "./Dialog";
import { Txt } from "./Txt";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Shared trigger: a sunken field that opens a picker dialog. */
function Trigger({ label, onPress, accessibilityLabel }: { label: string; onPress: () => void; accessibilityLabel: string }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[
        bevelStyle(t, "in"),
        { minHeight: 40, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 8 },
      ]}
    >
      <Txt variant="small">🗓️</Txt>
      <Txt style={{ flexShrink: 1 }}>{label}</Txt>
    </Pressable>
  );
}

/** Shared header: ◀ year ▶ */
function YearNav({ year, onChange }: { year: number; onChange: (y: number) => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <Btn small accessibilityLabel="Previous year" onPress={() => onChange(year - 1)}>
        ◀
      </Btn>
      <Txt variant="bold">{year}</Txt>
      <Btn small accessibilityLabel="Next year" onPress={() => onChange(year + 1)}>
        ▶
      </Btn>
    </View>
  );
}

function GridButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        bevelStyle(t, active ? "in" : "out"),
        {
          width: "31%",
          flexGrow: 1,
          minHeight: 44,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: active ? t.color.paperTint : t.color.face,
        },
      ]}
    >
      <Txt variant={active ? "bold" : "body"}>{label}</Txt>
    </Pressable>
  );
}

/** value: "YYYY-MM" */
export function MonthField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() => Number(value.slice(0, 4)) || new Date().getFullYear());
  const monthIdx = Number(value.slice(5, 7)) - 1;
  const label = `${FULL_MONTHS[monthIdx] ?? "—"} ${value.slice(0, 4)}`;

  return (
    <>
      <Trigger label={label} accessibilityLabel={`Month: ${label}`} onPress={() => setOpen(true)} />
      <Dialog title="Pick a month" icon="🗓️" open={open} onClose={() => setOpen(false)}>
        <YearNav year={year} onChange={setYear} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {MONTHS.map((m, i) => (
            <GridButton
              key={m}
              label={m}
              active={value === `${year}-${String(i + 1).padStart(2, "0")}`}
              onPress={() => {
                onChange(`${year}-${String(i + 1).padStart(2, "0")}`);
                setOpen(false);
              }}
            />
          ))}
        </View>
      </Dialog>
    </>
  );
}

/** value: "YYYY-Qn" */
export function QuarterField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() => Number(value.slice(0, 4)) || new Date().getFullYear());

  return (
    <>
      <Trigger label={value || "—"} accessibilityLabel={`Quarter: ${value}`} onPress={() => setOpen(true)} />
      <Dialog title="Pick a quarter" icon="🧭" open={open} onClose={() => setOpen(false)}>
        <YearNav year={year} onChange={setYear} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {[1, 2, 3, 4].map((q) => (
            <GridButton
              key={q}
              label={`Q${q}`}
              active={value === `${year}-Q${q}`}
              onPress={() => {
                onChange(`${year}-Q${q}`);
                setOpen(false);
              }}
            />
          ))}
        </View>
      </Dialog>
    </>
  );
}

/** value: "YYYY" */
export function YearField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() => Number(value) || new Date().getFullYear());

  return (
    <>
      <Trigger label={value || "—"} accessibilityLabel={`Year: ${value}`} onPress={() => setOpen(true)} />
      <Dialog title="Pick a year" icon="🏆" open={open} onClose={() => setOpen(false)}>
        <YearNav year={year} onChange={setYear} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {[-2, -1, 0, 1, 2, 3].map((offset) => {
            const y = String(year + offset);
            return (
              <GridButton
                key={y}
                label={y}
                active={value === y}
                onPress={() => {
                  onChange(y);
                  setOpen(false);
                }}
              />
            );
          })}
        </View>
      </Dialog>
    </>
  );
}
