import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useCategories, useGoalMutations, useGoals } from "@/data/goals";
import { todayISO } from "@/lib/dates";
import { groupGoals, horizonLabel, isCurrent, isPast } from "@/lib/horizons";
import type { Goal, GoalStatus, HorizonType } from "@/lib/types";
import { useTheme } from "@/theme/useTheme";
import { Btn, Chip, EmptyState, Progress, Screen, Txt, Window, bevelStyle } from "@/ui";
import { GoalDialog, emptyGoal } from "./GoalDialog";

type SectionKey = HorizonType;

const SECTIONS: { key: SectionKey; icon: string; short: string; title: string }[] = [
  { key: "date", icon: "📅", short: "Dated", title: "Dated Goals" },
  { key: "month", icon: "🗓️", short: "Month", title: "Monthly Goals" },
  { key: "quarter", icon: "🧭", short: "Quarter", title: "Quarterly Goals" },
  { key: "year", icon: "🏆", short: "Year", title: "Yearly Goals" },
];

const ORDER: Record<HorizonType, number> = { date: 0, month: 1, quarter: 2, year: 3 };

const STATUS_ICON: Record<GoalStatus, string> = {
  done: "✅",
  in_progress: "🔵",
  not_started: "⚪",
};

export function GoalsScreen() {
  const router = useRouter();
  const t = useTheme();
  const today = todayISO();
  const goals = useGoals();
  const categories = useCategories();
  const { cycleStatus } = useGoalMutations();

  const [horizon, setHorizon] = useState<SectionKey | "all">("all");
  const [period, setPeriod] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Goal> | null>(null);

  const all = useMemo(() => goals.data ?? [], [goals.data]);
  const cats = categories.data ?? [];

  const visible = useMemo(
    () => (categoryId ? all.filter((g) => g.category_id === categoryId) : all),
    [all, categoryId],
  );
  const byType = useMemo(() => groupGoals(visible), [visible]);

  /** Distinct periods inside the selected horizon, with counts. */
  const periods = useMemo(() => {
    if (horizon === "all") return [];
    const counts = new Map<string, number>();
    for (const goal of byType[horizon]) counts.set(goal.horizon_value, (counts.get(goal.horizon_value) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [byType, horizon]);

  const shown = useMemo(() => {
    const list =
      horizon === "all"
        ? [...visible]
        : byType[horizon].filter((g) => !period || g.horizon_value === period);
    return list.sort(
      (a, b) =>
        ORDER[a.horizon_type] - ORDER[b.horizon_type] ||
        a.horizon_value.localeCompare(b.horizon_value),
    );
  }, [horizon, period, visible, byType]);

  const meta = SECTIONS.find((s) => s.key === horizon);
  const paneTitle =
    horizon === "all"
      ? "All Goals"
      : `${meta!.title}${period ? ` — ${horizonLabel(horizon, period)}` : ""}`;
  const shownDone = shown.filter((g) => g.status === "done").length;

  function selectHorizon(next: SectionKey | "all") {
    setHorizon(next);
    setPeriod(null);
  }

  return (
    <Screen onBack={() => router.back()} refreshing={goals.isRefetching} onRefresh={goals.refetch}>
      <Window
        title="Goals"
        icon="🎯"
        actions={
          <Btn small onPress={() => setDraft(emptyGoal(today))}>
            New Goal
          </Btn>
        }
      >
        <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
          {all.length} goals · {all.filter((g) => g.status === "done").length} done ·{" "}
          {all.filter((g) => g.status === "in_progress").length} in progress
        </Txt>
      </Window>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ gap: 4 }}
      >
        <Chip label="🎯 All" active={horizon === "all"} count={visible.length} onPress={() => selectHorizon("all")} />
        {SECTIONS.map((s) => (
          <Chip
            key={s.key}
            label={`${s.icon} ${s.short}`}
            active={horizon === s.key}
            count={byType[s.key].length}
            onPress={() => selectHorizon(s.key)}
          />
        ))}
      </ScrollView>

      {horizon !== "all" ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, flexShrink: 0 }}
          contentContainerStyle={{ gap: 4 }}
        >
          <Chip label="All periods" active={!period} onPress={() => setPeriod(null)} />
          {periods.map(([value, count]) => (
            <Chip
              key={value}
              label={horizonLabel(horizon, value)}
              active={period === value}
              count={count}
              onPress={() => setPeriod(period === value ? null : value)}
            />
          ))}
          {periods.length === 0 ? <Txt variant="muted">— empty —</Txt> : null}
        </ScrollView>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ gap: 4 }}
      >
        <Chip
          label="All categories"
          active={!categoryId}
          count={all.length}
          onPress={() => setCategoryId(null)}
        />
        {cats.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            color={c.color}
            active={categoryId === c.id}
            count={all.filter((g) => g.category_id === c.id).length}
            onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}
          />
        ))}
      </ScrollView>

      <Window title={paneTitle} icon={horizon === "all" ? "🎯" : meta!.icon}>
        {shown.length > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <View style={{ flex: 1 }}>
              <Progress value={shownDone} max={shown.length} />
            </View>
            <Txt variant="bold" style={{ fontSize: t.metric.fontSmall }}>
              {shownDone} / {shown.length} complete
            </Txt>
          </View>
        ) : (
          <EmptyState icon="🎯" text="Nothing here yet." />
        )}

        {shown.map((goal) => {
          const category = cats.find((c) => c.id === goal.category_id);
          const past = goal.status !== "done" && isPast(goal.horizon_type, goal.horizon_value, today);
          const current = isCurrent(goal.horizon_type, goal.horizon_value, today);
          return (
            <View
              key={goal.id}
              style={[
                bevelStyle(t, "in"),
                {
                  padding: 8,
                  marginBottom: 6,
                  gap: 4,
                  borderLeftWidth: 6,
                  borderLeftColor: category?.color ?? t.color.dark,
                  backgroundColor: current ? t.color.paperTint : t.color.paper,
                },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Cycle status of ${goal.title}`}
                  hitSlop={8}
                  onPress={() => cycleStatus.mutate(goal)}
                >
                  <Txt style={{ fontSize: 16, lineHeight: 20 }}>{STATUS_ICON[goal.status]}</Txt>
                </Pressable>
                <Pressable style={{ flex: 1 }} accessibilityRole="button" onPress={() => setDraft({ ...goal })}>
                  <Txt
                    variant={goal.status === "done" ? "muted" : "bold"}
                    style={goal.status === "done" ? { textDecorationLine: "line-through" } : undefined}
                  >
                    {goal.title}
                  </Txt>
                </Pressable>
              </View>
              {goal.description ? (
                <Txt variant="muted" numberOfLines={2} style={{ fontSize: t.metric.fontSmall }}>
                  {goal.description}
                </Txt>
              ) : null}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                {category ? (
                  <View style={{ backgroundColor: category.color, paddingHorizontal: 5, paddingVertical: 1 }}>
                    <Txt style={{ fontSize: t.metric.fontSmall, color: "#ffffff" }}>{category.name}</Txt>
                  </View>
                ) : null}
                <View style={{ flex: 1 }} />
                <Txt variant={past ? "danger" : "muted"} style={{ fontSize: t.metric.fontSmall }}>
                  {horizonLabel(goal.horizon_type, goal.horizon_value)}
                  {past ? " !" : ""}
                </Txt>
              </View>
            </View>
          );
        })}
      </Window>

      <GoalDialog draft={draft} onChange={setDraft} onClose={() => setDraft(null)} categories={cats} />
    </Screen>
  );
}
