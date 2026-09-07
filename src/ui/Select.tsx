import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { bevelStyle } from "./Bevel";
import { Dialog } from "./Dialog";
import { Txt } from "./Txt";

export interface Option {
  value: string;
  label: string;
}

/** Combo box: a sunken field showing the current label, opening a retro list box. */
export function Select({
  value,
  options,
  onChange,
  placeholder = "—",
  title = "Choose",
  disabled,
}: {
  value: string | null | undefined;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  disabled?: boolean;
}) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled: !!disabled }}
        accessibilityLabel={`${title}: ${current?.label ?? placeholder}`}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          bevelStyle(t, "in"),
          {
            minHeight: 40,
            paddingHorizontal: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Txt numberOfLines={1} variant={current ? "body" : "muted"} style={{ flexShrink: 1 }}>
          {current?.label ?? placeholder}
        </Txt>
        <Txt variant="small">▾</Txt>
      </Pressable>

      <Dialog title={title} open={open} onClose={() => setOpen(false)}>
        <View style={[bevelStyle(t, "in"), { padding: 0 }]}>
          {options.map((o, i) => {
            const on = o.value === value;
            return (
              <Pressable
                key={o.value}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                style={{
                  minHeight: t.metric.tap,
                  justifyContent: "center",
                  paddingHorizontal: 10,
                  backgroundColor: on ? t.color.highlight : "transparent",
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: t.color.desk,
                }}
              >
                <Txt style={on ? { color: t.color.highlightText } : undefined}>{o.label}</Txt>
              </Pressable>
            );
          })}
        </View>
      </Dialog>
    </>
  );
}
