import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { fmt, fromISO, toISO, todayISO } from "@/lib/dates";
import { useTheme } from "@/theme/useTheme";
import { bevelStyle } from "./Bevel";
import { Btn } from "./Btn";
import { Dialog } from "./Dialog";
import { Txt } from "./Txt";

/**
 * Date picker that speaks the app's `YYYY-MM-DD` strings.
 * Android opens the OS dialog imperatively; iOS shows an inline picker inside a retro Dialog.
 */
export function DateField({
  value,
  onChange,
  allowClear,
  title = "Pick a date",
  placeholder = "—",
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  allowClear?: boolean;
  title?: string;
  placeholder?: string;
}) {
  const t = useTheme();
  const [draft, setDraft] = useState<string | null>(null);
  const current = value ?? todayISO();

  function open() {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: fromISO(current),
        mode: "date",
        onChange: (event, date) => {
          if (event.type === "set" && date) onChange(toISO(date));
        },
      });
    } else {
      setDraft(current);
    }
  }

  return (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${title}: ${value ? fmt(value) : placeholder}`}
          onPress={open}
          style={[
            bevelStyle(t, "in"),
            { flex: 1, minHeight: 40, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 8 },
          ]}
        >
          <Txt variant="small">📅</Txt>
          <Txt variant={value ? "body" : "muted"} numberOfLines={1} style={{ flexShrink: 1 }}>
            {value ? fmt(value) : placeholder}
          </Txt>
        </Pressable>
        {allowClear && value ? (
          <Btn small accessibilityLabel="Clear date" onPress={() => onChange(null)}>
            ✕
          </Btn>
        ) : null}
      </View>

      <Dialog
        title={title}
        icon="📅"
        open={draft !== null}
        onClose={() => setDraft(null)}
        footer={
          <>
            <Btn small onPress={() => setDraft(null)}>
              Cancel
            </Btn>
            <Btn
              small
              primary
              onPress={() => {
                if (draft) onChange(draft);
                setDraft(null);
              }}
            >
              OK
            </Btn>
          </>
        }
      >
        {draft !== null ? (
          <DateTimePicker
            value={fromISO(draft)}
            mode="date"
            display="inline"
            themeVariant={t.dark ? "dark" : "light"}
            onChange={(_event, date) => {
              if (date) setDraft(toISO(date));
            }}
          />
        ) : null}
      </Dialog>
    </>
  );
}
