import React, { useState } from "react";
import { View } from "react-native";
import { useTaskMutations, useTasks } from "@/data/tasks";
import { fmt, todayISO } from "@/lib/dates";
import { TASK_TABS, type TaskTab } from "@/lib/taskFilters";
import { describeRule, recurrenceError, withAnchor, type Recurrence } from "@/lib/recurrence";
import { PRIORITY_OPTS, priorityTone } from "@/lib/taskUi";
import type { Task } from "@/lib/types";
import { useTheme } from "@/theme/useTheme";
import {
  Btn,
  Check,
  DateField,
  EmptyState,
  Input,
  ListBox,
  ListRow,
  Screen,
  Select,
  TabBar,
  TabPanel,
  Txt,
  showToast,
} from "@/ui";
import { RecurrenceEditor } from "../shared/RecurrenceEditor";
import { TaskPropertiesDialog } from "../shared/TaskPropertiesDialog";

export function TasksScreen() {
  const t = useTheme();
  const today = todayISO();
  const [tab, setTab] = useState<TaskTab>("today");
  const [showDone, setShowDone] = useState(false);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState<string | null>(today);
  const [priority, setPriority] = useState("2");
  const [detail, setDetail] = useState<Task | null>(null);
  const [newRule, setNewRule] = useState<Recurrence | null>(null);

  const { data: tasks = [], isLoading, refetch, isRefetching } = useTasks(tab, showDone);
  const { create, toggleDone } = useTaskMutations();

  function add() {
    if (!title.trim()) return;
    const rule = newRule ? withAnchor(newRule, due) : null;
    const problem = recurrenceError(rule, due);
    if (problem) return showToast(problem);
    create.mutate({ title, due_date: due, priority: Number(priority), recurrence: rule });
    setTitle("");
    setNewRule(null);
  }

  const doneCount = tasks.filter((task) => task.status === "done").length;

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <TabBar tabs={TASK_TABS} active={tab} onSelect={(k) => setTab(k as TaskTab)} />
      <TabPanel>
        <Input
          placeholder="New task title…"
          value={title}
          onChangeText={setTitle}
          returnKeyType="done"
          onSubmitEditing={add}
        />
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <DateField
              value={due}
              onChange={(d) => {
                setDue(d);
                setNewRule((r) => (r ? withAnchor(r, d) : r));
              }}
              allowClear
              title="Due date"
            />
          </View>
          <View style={{ width: 92 }}>
            <Select title="Priority" value={priority} onChange={setPriority} options={PRIORITY_OPTS} />
          </View>
          <Btn primary onPress={add}>
            Add
          </Btn>
        </View>
        <Check
          label="Repeat"
          checked={!!newRule}
          onChange={(on) => setNewRule(on ? withAnchor({ freq: "daily", interval: 1 }, due) : null)}
        />
        {newRule ? <RecurrenceEditor value={newRule} anchorIso={due} onChange={setNewRule} /> : null}

        {tab !== "done" ? (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Check label="Show completed" checked={showDone} onChange={setShowDone} />
            <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
              {doneCount} done / {tasks.length} shown
            </Txt>
          </View>
        ) : null}

        <ListBox>
          {isLoading ? <EmptyState text="Loading…" /> : null}
          {!isLoading && tasks.length === 0 ? (
            <EmptyState icon="📋" text="No tasks here. Add one above. ▲" />
          ) : null}
          {tasks.map((task, i) => {
            const overdue = task.status !== "done" && !!task.due_date && task.due_date < today;
            return (
              <ListRow
                key={task.id}
                last={i === tasks.length - 1}
                strike={task.status === "done"}
                title={task.title}
                subtitle={
                  [task.recurrence ? `🔁 ${describeRule(task.recurrence)}` : null, task.description]
                    .filter(Boolean)
                    .join("\n") || null
                }
                onPress={() => setDetail({ ...task })}
                left={<Check checked={task.status === "done"} onChange={() => toggleDone.mutate(task)} />}
                right={
                  <>
                    <Txt variant={priorityTone(task.priority)} style={{ fontSize: t.metric.fontSmall }}>
                      P{task.priority}
                    </Txt>
                    <Txt
                      variant={overdue ? "danger" : "muted"}
                      style={{ fontSize: t.metric.fontSmall, width: 78, textAlign: "right" }}
                    >
                      {task.due_date ? fmt(task.due_date) : "—"}
                      {overdue ? " !" : ""}
                    </Txt>
                  </>
                }
              />
            );
          })}
        </ListBox>
      </TabPanel>

      <TaskPropertiesDialog allowRepeat draft={detail} onChange={setDetail} onClose={() => setDetail(null)} />
    </Screen>
  );
}
