import React, { useMemo, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { useBooks } from "@/data/books";
import { useGoals } from "@/data/goals";
import { useHabitEntries, useHabitMutations, useHabits } from "@/data/habits";
import { usePinnedNotes } from "@/data/notes";
import { useTaskMutations, useTasksCompletedOn, useTasksDueUpTo } from "@/data/tasks";
import { addDays, fmt, todayISO } from "@/lib/dates";
import { currentValues } from "@/lib/horizons";
import { isOverdue, sortReadingItems } from "@/lib/reading";
import { openFromTab } from "@/lib/moreNavigation";
import { computeStreaks } from "@/lib/streaks";
import { useTheme } from "@/theme/useTheme";
import { Btn, Check, EmptyState, Fab, Progress, Screen, Txt, Window } from "@/ui";
import { HabitDots } from "./HabitStrip";

function OpenLink({ href, label }: { href: string; label: string }) {
  return (
    <Pressable accessibilityRole="link" onPress={() => openFromTab(href)} style={{ paddingVertical: 6 }}>
      <Txt variant="link" style={{ fontSize: 12 }}>
        {label}
      </Txt>
    </Pressable>
  );
}

function GlanceRow({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 3,
        borderBottomWidth: 1,
        borderBottomColor: t.color.desk,
      }}
    >
      <Txt variant="muted">{label}</Txt>
      <Txt variant="bold">{value}</Txt>
    </View>
  );
}

export function DashboardScreen() {
  const t = useTheme();
  const today = todayISO();
  const [showDone, setShowDone] = useState(false);

  const openTasks = useTasksDueUpTo(today);
  const doneTasks = useTasksCompletedOn(today);
  const habits = useHabits();
  const entries = useHabitEntries(addDays(today, -60), today);
  const goals = useGoals();
  const notes = usePinnedNotes(5);
  const books = useBooks();

  const { toggleDone } = useTaskMutations();
  const { toggle } = useHabitMutations();

  const refreshing =
    openTasks.isRefetching || habits.isRefetching || goals.isRefetching || books.isRefetching;
  const refresh = () => {
    openTasks.refetch();
    doneTasks.refetch();
    habits.refetch();
    entries.refetch();
    goals.refetch();
    notes.refetch();
    books.refetch();
  };

  const activeHabits = useMemo(() => (habits.data ?? []).filter((h) => h.active), [habits.data]);
  const entryRows = useMemo(() => entries.data ?? [], [entries.data]);
  const checkedOn = (habitId: string, date: string) =>
    entryRows.some((e) => e.habit_id === habitId && e.date === date && e.checked);

  const streaks = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeStreaks>>();
    for (const habit of activeHabits) {
      const dates = entryRows.filter((e) => e.habit_id === habit.id && e.checked).map((e) => e.date);
      map.set(habit.id, computeStreaks(dates, today));
    }
    return map;
  }, [activeHabits, entryRows, today]);

  /** Same window the web app uses: dated goals within 14 days, plus this month and this quarter. */
  const focusGoals = useMemo(() => {
    const cur = currentValues(today);
    return (goals.data ?? [])
      .filter((g) => g.status !== "done")
      .filter(
        (g) =>
          (g.horizon_type === "date" && g.horizon_value >= today && g.horizon_value <= addDays(today, 14)) ||
          (g.horizon_type === "month" && g.horizon_value === cur.month) ||
          (g.horizon_type === "quarter" && g.horizon_value === cur.quarter),
      );
  }, [goals.data, today]);

  const reading = (books.data ?? []).filter((b) => b.item_type === "book" && b.status === "reading");
  const articlesDue = sortReadingItems(
    (books.data ?? []).filter(
      (b) => b.item_type === "article" && b.status === "to_read" && b.due_date && b.due_date <= today,
    ),
  );

  const open = openTasks.data ?? [];
  const done = doneTasks.data ?? [];
  const total = open.length + done.length;
  const habitsDone = activeHabits.filter((h) => checkedOn(h.id, today)).length;
  const bestStreak = activeHabits.reduce((m, h) => Math.max(m, streaks.get(h.id)?.current ?? 0), 0);

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={refresh}
      fab={<Fab icon="🗒️" label="Open Notes" onPress={() => openFromTab("/more/notes")} />}
    >
      <Window
        title={`Today — ${fmt(today)}`}
        icon="📋"
        actions={
          <Btn small onPress={() => setShowDone((v) => !v)}>
            {`${showDone ? "Hide" : "Show"} done (${done.length})`}
          </Btn>
        }
      >
        {total > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <View style={{ flex: 1 }}>
              <Progress value={done.length} max={total} />
            </View>
            <Txt variant="bold" style={{ fontSize: t.metric.fontSmall }}>
              {done.length} / {total} done
            </Txt>
          </View>
        ) : null}

        {open.length === 0 ? <EmptyState icon="🎉" text="All clear." /> : null}
        {open.map((task) => (
          <View key={task.id} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Check checked={false} onChange={() => toggleDone.mutate(task)} label={task.title} />
            {task.due_date && task.due_date < today ? (
              <Txt variant="danger" style={{ fontSize: t.metric.fontSmall }}>
                overdue!
              </Txt>
            ) : null}
          </View>
        ))}

        {showDone ? (
          <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: t.color.dark, paddingTop: 6 }}>
            <Txt variant="bold" style={{ fontSize: t.metric.fontSmall }}>
              Completed today
            </Txt>
            {done.length === 0 ? <Txt variant="muted">Nothing completed today yet.</Txt> : null}
            {done.map((task) => (
              <Check key={task.id} checked onChange={() => toggleDone.mutate(task)} label={task.title} />
            ))}
          </View>
        ) : null}
        <OpenLink href="/tasks" label="Open Tasks →" />
      </Window>

      <Window title="Currently Reading" icon="📖">
        {reading.length === 0 ? <EmptyState text="Nothing on the go — visit the Reading shelf." /> : null}
        {reading.map((book) => (
          <Txt key={book.id} style={{ paddingVertical: 2 }}>
            📖 {book.title}
            {book.author ? ` — ${book.author}` : ""}
          </Txt>
        ))}
        <OpenLink href="/more/reading" label="Open Reading →" />
      </Window>

      <Window title="Articles Due" icon="📰">
        {articlesDue.length === 0 ? <EmptyState text="No articles due today." /> : null}
        {articlesDue.map((article) => (
          <View key={article.id} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Txt>📰</Txt>
            {article.link ? (
              <Pressable accessibilityRole="link" onPress={() => Linking.openURL(article.link!)}>
                <Txt variant="link">{article.title}</Txt>
              </Pressable>
            ) : (
              <Txt variant="bold">{article.title}</Txt>
            )}
            {isOverdue(article, today) ? (
              <Txt variant="danger" style={{ fontSize: t.metric.fontSmall }}>
                overdue!
              </Txt>
            ) : null}
          </View>
        ))}
        <OpenLink href="/more/reading" label="Open Reading →" />
      </Window>

      <Window title="Pinned Notes" icon="📌">
        {(notes.data ?? []).length === 0 ? <EmptyState text="No pinned notes." /> : null}
        {(notes.data ?? []).map((note) => (
          <Txt key={note.id} numberOfLines={1} style={{ paddingVertical: 2 }}>
            📌 {note.title ?? note.body}
          </Txt>
        ))}
        <OpenLink href="/more/notes" label="Open Notes →" />
      </Window>

      <Window title="Goals in Focus" icon="🎯">
        {focusGoals.length === 0 ? <EmptyState text="No active goals in the current period." /> : null}
        {focusGoals.slice(0, 8).map((goal) => (
          <Txt key={goal.id} style={{ paddingVertical: 2 }}>
            {goal.status === "in_progress" ? "🔵" : "⚪"} {goal.title}
          </Txt>
        ))}
        <OpenLink href="/more/goals" label="Open Goals →" />
      </Window>

      <Window
        title="Today's Habits"
        icon="✅"
        actions={
          <Txt variant="title">
            {habitsDone} / {activeHabits.length}
          </Txt>
        }
      >
        {activeHabits.length === 0 ? <EmptyState text="No habits configured." /> : null}
        {activeHabits.map((habit) => (
          <View
            key={habit.id}
            style={{ borderBottomWidth: 1, borderBottomColor: t.color.desk, paddingVertical: 4 }}
          >
            <Check
              checked={checkedOn(habit.id, today)}
              onChange={(next) => toggle.mutate({ habitId: habit.id, date: today, checked: next })}
              label={`${habit.icon} ${habit.name}`}
            />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 30 }}>
              <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
                🔥 {streaks.get(habit.id)?.current ?? 0}
              </Txt>
              <View style={{ flex: 1 }} />
              <HabitDots today={today} isCheckedOn={(d) => checkedOn(habit.id, d)} />
            </View>
          </View>
        ))}
        <OpenLink href="/habits" label="Open Habits →" />
      </Window>

      <Window title="At a Glance" icon="📊">
        <GlanceRow label="Tasks today" value={`${done.length} / ${total}`} />
        <GlanceRow label="Habits today" value={`${habitsDone} / ${activeHabits.length}`} />
        <GlanceRow label="Longest streak" value={`🔥 ${bestStreak}`} />
        <GlanceRow label="Goals in focus" value={String(focusGoals.length)} />
        <GlanceRow label="Books reading" value={String(reading.length)} />
        <GlanceRow label="Articles due" value={String(articlesDue.length)} />
      </Window>
    </Screen>
  );
}
