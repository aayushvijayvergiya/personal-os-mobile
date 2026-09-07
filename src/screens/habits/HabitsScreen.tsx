import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useHabitEntries, useHabitMutations, useHabits } from "@/data/habits";
import { addDays, fmt, fromISO, todayISO, weekDates } from "@/lib/dates";
import { computeStreaks } from "@/lib/streaks";
import type { Habit } from "@/lib/types";
import { useTheme } from "@/theme/useTheme";
import { Btn, Dialog, EmptyState, Input, Screen, Txt, Window } from "@/ui";
import { DayToggle } from "./DayToggle";

/** "1 – 7 Sep 2026", or "29 Aug – 4 Sep 2026" across a month boundary. */
function weekLabel(days: string[]): string {
  const first = fromISO(days[0]);
  const last = fromISO(days[6]);
  const sameMonth = first.getMonth() === last.getMonth();
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const start = sameMonth
    ? String(first.getDate())
    : first.toLocaleDateString("en-US", opts);
  return `${start} – ${last.toLocaleDateString("en-US", opts)} ${last.getFullYear()}`;
}

/** Rename field that commits on blur, the way the web app's manage list behaves. */
function HabitNameInput({ habit, onCommit }: { habit: Habit; onCommit: (name: string) => void }) {
  const [name, setName] = useState(habit.name);
  return (
    <Input
      value={name}
      onChangeText={setName}
      accessibilityLabel={`Rename ${habit.name}`}
      onBlur={() => {
        const trimmed = name.trim();
        if (trimmed && trimmed !== habit.name) onCommit(trimmed);
      }}
    />
  );
}

export function HabitsScreen() {
  const t = useTheme();
  const today = todayISO();
  const [anchor, setAnchor] = useState(today);
  const [manage, setManage] = useState(false);
  const [newName, setNewName] = useState("");

  const days = weekDates(anchor);
  const habits = useHabits();
  // 60 days of history covers the current streak and the 30-day rate.
  const entries = useHabitEntries(addDays(anchor, -60), addDays(anchor, 7));
  const { toggle, create, rename, setActive, swapOrder } = useHabitMutations();

  const all = habits.data ?? [];
  const active = all.filter((h) => h.active);
  const rows = useMemo(() => entries.data ?? [], [entries.data]);

  const isChecked = (habitId: string, date: string) =>
    rows.some((e) => e.habit_id === habitId && e.date === date && e.checked);

  const statsFor = (habit: Habit) =>
    computeStreaks(
      rows.filter((e) => e.habit_id === habit.id && e.checked).map((e) => e.date),
      today,
    );

  function addHabit() {
    if (!newName.trim()) return;
    create.mutate({ name: newName, sortOrder: all.length });
    setNewName("");
  }

  function move(habit: Habit, direction: -1 | 1) {
    const index = all.findIndex((h) => h.id === habit.id);
    const other = all[index + direction];
    if (other) swapOrder.mutate({ a: habit, b: other });
  }

  return (
    <Screen
      refreshing={habits.isRefetching}
      onRefresh={() => {
        habits.refetch();
        entries.refetch();
      }}
    >
      <Window
        title="Habit Tracker"
        icon="✅"
        actions={
          <>
            <Btn small accessibilityLabel="Previous week" onPress={() => setAnchor(addDays(anchor, -7))}>
              ◀
            </Btn>
            <Btn small accessibilityLabel="Next week" onPress={() => setAnchor(addDays(anchor, 7))}>
              ▶
            </Btn>
          </>
        }
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <Txt variant="bold" style={{ flex: 1 }}>
            {weekLabel(days)}
          </Txt>
          <Btn small onPress={() => setAnchor(today)}>
            This week
          </Btn>
        </View>

        {/* Column header. Cards below use the same seven flex:1 columns, so everything lines up. */}
        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: t.color.dark }}>
          {days.map((date) => (
            <View
              key={date}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 3,
                backgroundColor: date === today ? t.color.paperTint : "transparent",
              }}
            >
              <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
                {fromISO(date).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1)}
              </Txt>
              <Txt variant={date === today ? "bold" : "body"} style={{ fontSize: t.metric.fontSmall }}>
                {fromISO(date).getDate()}
              </Txt>
            </View>
          ))}
        </View>

        {active.length === 0 ? (
          <EmptyState icon="✅" text="No habits yet — tap Manage habits… to add some." />
        ) : null}

        {active.map((habit) => {
          const stats = statsFor(habit);
          const thisWeek = days.filter((date) => isChecked(habit.id, date)).length;
          return (
            <View
              key={habit.id}
              style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.color.dark }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Txt variant="bold" numberOfLines={1} style={{ flex: 1 }}>
                  {habit.icon} {habit.name}
                </Txt>
                <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
                  {thisWeek}/7
                </Txt>
              </View>

              <View style={{ flexDirection: "row" }}>
                {days.map((date) => (
                  <DayToggle
                    key={date}
                    checked={isChecked(habit.id, date)}
                    disabled={date > today}
                    highlight={date === today}
                    label={`${habit.name} on ${fmt(date)}`}
                    onPress={() =>
                      toggle.mutate({ habitId: habit.id, date, checked: !isChecked(habit.id, date) })
                    }
                  />
                ))}
              </View>

              <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
                <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
                  🔥 {stats.current} streak
                </Txt>
                <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
                  🏅 {stats.best} best
                </Txt>
                <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
                  📊 {stats.completionPct}% of 30d
                </Txt>
              </View>
            </View>
          );
        })}

        <Btn style={{ marginTop: 10 }} onPress={() => setManage(true)}>
          Manage habits…
        </Btn>
      </Window>

      <Dialog
        title="Manage Habits"
        icon="✅"
        open={manage}
        onClose={() => setManage(false)}
        footer={
          <Btn small primary onPress={() => setManage(false)}>
            Close
          </Btn>
        }
      >
        <View style={{ flexDirection: "row", gap: 6 }}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="New habit name…"
              value={newName}
              onChangeText={setNewName}
              returnKeyType="done"
              onSubmitEditing={addHabit}
            />
          </View>
          <Btn primary onPress={addHabit}>
            Add
          </Btn>
        </View>

        {all.map((habit) => (
          <View
            key={habit.id}
            style={{
              gap: 6,
              paddingVertical: 8,
              borderTopWidth: 1,
              borderTopColor: t.color.dark,
            }}
          >
            <HabitNameInput habit={habit} onCommit={(name) => rename.mutate({ id: habit.id, name })} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {habit.active ? null : (
                <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
                  retired
                </Txt>
              )}
              <View style={{ flex: 1 }} />
              <Btn small accessibilityLabel={`Move ${habit.name} up`} onPress={() => move(habit, -1)}>
                ▲
              </Btn>
              <Btn small accessibilityLabel={`Move ${habit.name} down`} onPress={() => move(habit, 1)}>
                ▼
              </Btn>
              <Btn small onPress={() => setActive.mutate({ id: habit.id, active: !habit.active })}>
                {habit.active ? "Retire" : "Restore"}
              </Btn>
            </View>
          </View>
        ))}
      </Dialog>
    </Screen>
  );
}
