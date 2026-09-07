import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { useBooks } from "@/data/books";
import { useGoals } from "@/data/goals";
import { useTaskMutations, useTasksInRange } from "@/data/tasks";
import { CALENDAR_FIXED, type CalendarPalette } from "@/lib/calendarColors";
import { calendarItems, periodGoalBanners } from "@/lib/calendarItems";
import { addDays, fmt, fromISO, monthRange, todayISO, weekRange } from "@/lib/dates";
import { useTheme } from "@/theme/useTheme";
import { Btn, Input, Screen, Txt, Window, bevelStyle } from "@/ui";
import { CalendarGrid } from "../shared/CalendarGrid";

/** Step the anchor by one week or one calendar month. */
function shiftAnchor(anchor: string, mode: "month" | "week", direction: 1 | -1): string {
  if (mode === "week") return addDays(anchor, direction * 7);
  const [year, month] = anchor.split("-").map(Number);
  const d = new Date(year, month - 1 + direction, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function CalendarScreen() {
  const router = useRouter();
  const t = useTheme();
  const today = todayISO();
  const [mode, setMode] = useState<"month" | "week">("month");
  const [anchor, setAnchor] = useState(today);
  const [selected, setSelected] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState("");

  const range = mode === "month" ? monthRange(anchor) : weekRange(anchor);
  // A week of slack either side so items just outside the grid still render in its edge cells.
  const from = addDays(range.start, -7);
  const to = addDays(range.end, 7);

  const tasks = useTasksInRange(from, to);
  const goals = useGoals();
  const books = useBooks();
  const { create } = useTaskMutations();

  const palette: CalendarPalette = useMemo(
    () => ({
      taskUrgent: t.color.danger,
      task: t.color.highlight,
      goal: CALENDAR_FIXED.goal,
      article: CALENDAR_FIXED.article,
    }),
    [t],
  );

  const articles = useMemo(
    () =>
      (books.data ?? []).filter(
        (b) => b.item_type === "article" && b.due_date && b.due_date >= from && b.due_date <= to,
      ),
    [books.data, from, to],
  );

  const items = useMemo(
    () => calendarItems({ tasks: tasks.data ?? [], goals: goals.data ?? [], articles }, palette),
    [tasks.data, goals.data, articles, palette],
  );
  const banners = useMemo(
    () => periodGoalBanners(goals.data ?? [], anchor, CALENDAR_FIXED.goal),
    [goals.data, anchor],
  );

  const dayTasks = (tasks.data ?? []).filter((task) => task.due_date === selected);
  const dayArticles = articles.filter((a) => a.due_date === selected);
  const monthName = fromISO(anchor).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function quickAdd() {
    if (!quickTitle.trim() || !selected) return;
    create.mutate({ title: quickTitle, due_date: selected });
    setQuickTitle("");
  }

  return (
    <Screen onBack={() => router.back()} refreshing={tasks.isRefetching} onRefresh={tasks.refetch}>
      <Window
        title="Calendar"
        icon="📅"
        actions={
          <>
            <Btn small accessibilityLabel="Previous" onPress={() => setAnchor(shiftAnchor(anchor, mode, -1))}>
              ◀
            </Btn>
            <Btn small onPress={() => setAnchor(today)}>
              Today
            </Btn>
            <Btn small accessibilityLabel="Next" onPress={() => setAnchor(shiftAnchor(anchor, mode, 1))}>
              ▶
            </Btn>
          </>
        }
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <Txt variant="bold" style={{ flex: 1 }}>
            {monthName}
          </Txt>
          <Btn small primary={mode === "week"} onPress={() => setMode("week")}>
            Week
          </Btn>
          <Btn small primary={mode === "month"} onPress={() => setMode("month")}>
            Month
          </Btn>
        </View>

        <CalendarGrid
          mode={mode}
          anchor={anchor}
          items={items}
          banners={banners}
          selected={selected}
          onSelectDay={setSelected}
        />

        {selected ? (
          <View style={[bevelStyle(t, "out"), { padding: 8, marginTop: 6, gap: 4 }]}>
            <Txt variant="bold">{fmt(selected)}</Txt>
            {dayTasks.length === 0 && dayArticles.length === 0 ? (
              <Txt variant="muted">Nothing due.</Txt>
            ) : null}
            {dayTasks.map((task) => (
              <Txt key={task.id}>
                • {task.title}
                {task.status === "done" ? " ✔" : ""}
              </Txt>
            ))}
            {dayArticles.map((article) => (
              <View key={article.id} style={{ flexDirection: "row", gap: 4 }}>
                <Txt>📰</Txt>
                {article.link ? (
                  <Pressable accessibilityRole="link" onPress={() => Linking.openURL(article.link!)}>
                    <Txt variant="link">{article.title}</Txt>
                  </Pressable>
                ) : (
                  <Txt>{article.title}</Txt>
                )}
                {article.status === "finished" ? <Txt>✔</Txt> : null}
              </View>
            ))}
            <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="Quick add task for this day…"
                  value={quickTitle}
                  onChangeText={setQuickTitle}
                  returnKeyType="done"
                  onSubmitEditing={quickAdd}
                />
              </View>
              <Btn primary onPress={quickAdd}>
                Add
              </Btn>
            </View>
          </View>
        ) : null}
      </Window>
    </Screen>
  );
}
