import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import type { CalBanner, CalItem } from "@/lib/calendarItems";
import { fromISO, monthGridDates, todayISO, weekDates } from "@/lib/dates";
import { useTheme } from "@/theme/useTheme";
import { Chip, Txt } from "@/ui";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Month or week grid. Month cells show a day number and up to three colour dots; week cells are
 * taller and show labels. Used by both the Calendar module and the Projects calendar tab.
 */
export function CalendarGrid({
  mode,
  anchor,
  items,
  banners = [],
  selected,
  onSelectDay,
}: {
  mode: "month" | "week";
  anchor: string;
  items: CalItem[];
  banners?: CalBanner[];
  selected?: string | null;
  onSelectDay?: (date: string) => void;
}) {
  const t = useTheme();
  const today = todayISO();
  const dates = mode === "month" ? monthGridDates(anchor) : weekDates(anchor);
  const anchorMonth = anchor.slice(0, 7);

  const byDate = useMemo(() => {
    const map = new Map<string, CalItem[]>();
    for (const item of items) {
      const list = map.get(item.date);
      if (list) list.push(item);
      else map.set(item.date, [item]);
    }
    return map;
  }, [items]);

  return (
    <View style={{ gap: 4 }}>
      {banners.length > 0 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
          {banners.map((b) => (
            <Chip key={b.id} label={`🎯 ${b.label}`} color={b.color} />
          ))}
        </View>
      ) : null}

      <View style={{ flexDirection: "row" }}>
        {WEEKDAYS.map((d) => (
          <View key={d} style={{ width: `${100 / 7}%`, alignItems: "center", paddingVertical: 2 }}>
            <Txt variant="bold" style={{ fontSize: t.metric.fontSmall }}>
              {d.slice(0, mode === "month" ? 1 : 3)}
            </Txt>
          </View>
        ))}
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          borderWidth: t.metric.bevel,
          borderTopColor: t.color.dark,
          borderLeftColor: t.color.dark,
          borderBottomColor: t.color.light,
          borderRightColor: t.color.light,
          backgroundColor: t.color.paper,
        }}
      >
        {dates.map((date) => {
          const dayItems = byDate.get(date) ?? [];
          const outside = mode === "month" && date.slice(0, 7) !== anchorMonth;
          const isToday = date === today;
          const isSelected = date === selected;
          return (
            <Pressable
              key={date}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${date}, ${dayItems.length} item${dayItems.length === 1 ? "" : "s"}`}
              onPress={() => onSelectDay?.(date)}
              style={{
                width: `${100 / 7}%`,
                minHeight: mode === "month" ? 52 : 96,
                padding: 2,
                borderWidth: 1,
                borderColor: isSelected ? t.color.highlight : t.color.desk,
                backgroundColor: isToday ? t.color.paperTint : t.color.paper,
                opacity: outside ? 0.45 : 1,
              }}
            >
              <Txt
                variant={isToday ? "bold" : "muted"}
                style={{ fontSize: t.metric.fontSmall, textAlign: "right" }}
              >
                {fromISO(date).getDate()}
              </Txt>

              {mode === "month" ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 2, marginTop: 2 }}>
                  {dayItems.slice(0, 3).map((item) => (
                    <View
                      key={item.id}
                      style={{
                        width: 7,
                        height: 7,
                        backgroundColor: item.color,
                        opacity: item.done ? 0.4 : 1,
                      }}
                    />
                  ))}
                  {dayItems.length > 3 ? (
                    <Txt variant="muted" style={{ fontSize: 9, lineHeight: 10 }}>
                      +{dayItems.length - 3}
                    </Txt>
                  ) : null}
                </View>
              ) : (
                <View style={{ gap: 2, marginTop: 2 }}>
                  {dayItems.slice(0, 3).map((item) => (
                    <View key={item.id} style={{ backgroundColor: item.color, paddingHorizontal: 2 }}>
                      <Txt
                        numberOfLines={1}
                        style={{
                          fontSize: 9,
                          lineHeight: 12,
                          color: "#ffffff",
                          textDecorationLine: item.done ? "line-through" : "none",
                        }}
                      >
                        {item.label}
                      </Txt>
                    </View>
                  ))}
                  {dayItems.length > 3 ? (
                    <Txt variant="muted" style={{ fontSize: 9, lineHeight: 11 }}>
                      +{dayItems.length - 3} more…
                    </Txt>
                  ) : null}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
