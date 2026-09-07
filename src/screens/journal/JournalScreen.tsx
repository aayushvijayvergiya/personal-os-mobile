import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useHabitEntries, useHabitMutations, useHabits } from "@/data/habits";
import { useJournalEntry, useJournalQuestions } from "@/data/journal";
import { useTaskMutations, useTasksDueOn } from "@/data/tasks";
import { addDays, fmt, isoWeekLabel, todayISO, weekStart } from "@/lib/dates";
import type { JournalType } from "@/lib/types";
import { useTheme } from "@/theme/useTheme";
import { Btn, Check, Chip, EmptyState, Screen, TabBar, TabPanel, Txt } from "@/ui";
import { JournalBody } from "./JournalBody";

const TABS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
];

export function JournalScreen() {
  const t = useTheme();
  const today = todayISO();
  const [type, setType] = useState<JournalType>("daily");
  // Each tab remembers its own date, as on the web.
  const [dates, setDates] = useState<Record<JournalType, string>>({ daily: today, weekly: today });
  const [tasksOpen, setTasksOpen] = useState(false);

  const date = type === "weekly" ? weekStart(dates.weekly) : dates.daily;
  const setDate = (next: string) => setDates((m) => ({ ...m, [type]: next }));
  const step = type === "daily" ? 1 : 7;
  const heading = type === "daily" ? fmt(date) : isoWeekLabel(date);
  const period = type === "daily" ? "day" : "week";

  const questions = useJournalQuestions(type);
  const entry = useJournalEntry(type, date);
  const habits = useHabits();
  const entries = useHabitEntries(date, date);
  const tasks = useTasksDueOn(date);
  const { toggle } = useHabitMutations();
  const { toggleDone } = useTaskMutations();

  const activeHabits = (habits.data ?? []).filter((h) => h.active);
  const habitChecked = (habitId: string) =>
    (entries.data ?? []).some((e) => e.habit_id === habitId && e.checked);
  const dayTasks = tasks.data ?? [];
  const tasksDone = dayTasks.filter((task) => task.status === "done").length;

  return (
    <Screen refreshing={entry.isRefetching} onRefresh={() => { entry.refetch(); questions.refetch(); }}>
      <TabBar tabs={TABS} active={type} onSelect={(k) => setType(k as JournalType)} />
      <TabPanel>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Btn small accessibilityLabel={`Previous ${period}`} onPress={() => setDate(addDays(date, -step))}>
            ◀
          </Btn>
          <Txt variant="bold" style={{ flex: 1, textAlign: "center" }}>
            {heading}
          </Txt>
          <Btn small accessibilityLabel={`Next ${period}`} onPress={() => setDate(addDays(date, step))}>
            ▶
          </Btn>
          <Btn small onPress={() => setDate(today)}>
            Today
          </Btn>
        </View>

        {type === "daily" ? (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0, flexShrink: 0 }}
              contentContainerStyle={{ gap: 4, alignItems: "center" }}
            >
              <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
                ✅
              </Txt>
              {activeHabits.length === 0 ? (
                <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
                  No habits configured.
                </Txt>
              ) : null}
              {activeHabits.map((habit) => (
                <Chip
                  key={habit.id}
                  label={`${habit.icon} ${habit.name}`}
                  active={habitChecked(habit.id)}
                  onPress={() =>
                    toggle.mutate({ habitId: habit.id, date, checked: !habitChecked(habit.id) })
                  }
                />
              ))}
            </ScrollView>

            <Btn small onPress={() => setTasksOpen((v) => !v)}>
              {`📋 ${tasksDone} / ${dayTasks.length} ${tasksOpen ? "▴" : "▾"}`}
            </Btn>
            {tasksOpen ? (
              <View style={{ paddingLeft: 8, gap: 2 }}>
                {dayTasks.length === 0 ? (
                  <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
                    No tasks due this {period}.
                  </Txt>
                ) : null}
                {dayTasks.map((task) => (
                  <Check
                    key={task.id}
                    checked={task.status === "done"}
                    onChange={() => toggleDone.mutate(task)}
                    label={task.title}
                  />
                ))}
              </View>
            ) : null}
          </>
        ) : null}

        {entry.data ? (
          <JournalBody
            key={`${type}:${date}`}
            entry={entry.data}
            questions={questions.data ?? []}
            type={type}
            date={date}
            heading={heading}
          />
        ) : (
          <EmptyState text={entry.isError ? "Could not open this entry." : "Loading…"} />
        )}
      </TabPanel>
    </Screen>
  );
}
