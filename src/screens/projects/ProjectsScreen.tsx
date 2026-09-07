import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { useProjects } from "@/data/projects";
import { useProjectTasks, useTaskMutations } from "@/data/tasks";
import type { CalItem } from "@/lib/calendarItems";
import { addDays, fmt, fromISO, todayISO } from "@/lib/dates";
import type { Project, Task } from "@/lib/types";
import { useTheme } from "@/theme/useTheme";
import {
  Btn,
  EmptyState,
  ListBox,
  Screen,
  Select,
  TabBar,
  TabPanel,
  TitleBar,
  Txt,
  Window,
  bevelStyle,
} from "@/ui";
import { CalendarGrid } from "../shared/CalendarGrid";
import { TaskPropertiesDialog } from "../shared/TaskPropertiesDialog";
import { ProjectDialog, emptyProject } from "./ProjectDialog";
import { ProjectTaskRow } from "./ProjectTaskRow";

const TABS = [
  { key: "board", label: "Projects" },
  { key: "all", label: "All Tasks" },
  { key: "calendar", label: "Calendar" },
];

const STATUS_LABEL: Record<Task["status"], string> = {
  open: "Open",
  in_progress: "In Progress",
  done: "Done",
};

export function ProjectsScreen() {
  const t = useTheme();
  const router = useRouter();
  const today = todayISO();
  const [tab, setTab] = useState("board");
  const [groupBy, setGroupBy] = useState<"project" | "due" | "status">("project");
  const [projectDraft, setProjectDraft] = useState<Partial<Project> | null>(null);
  const [taskDraft, setTaskDraft] = useState<Task | null>(null);

  const projects = useProjects();
  const tasks = useProjectTasks();
  const { toggleDone } = useTaskMutations();

  const projectList = useMemo(() => projects.data ?? [], [projects.data]);
  const taskList = useMemo(() => tasks.data ?? [], [tasks.data]);
  const projectFor = (id: string | null) => projectList.find((p) => p.id === id);
  const countFor = (id: string) => {
    const mine = taskList.filter((task) => task.project_id === id);
    return { done: mine.filter((task) => task.status === "done").length, total: mine.length };
  };

  /** Tasks belonging to a live (non-archived) project, grouped for the All Tasks tab. */
  const groups = useMemo(() => {
    const live = taskList.filter((task) => projectList.some((p) => p.id === task.project_id));
    if (groupBy === "project") {
      return projectList.map((p) => ({
        key: p.id,
        label: `📁 ${p.name}`,
        color: p.color,
        items: live.filter((task) => task.project_id === p.id),
      }));
    }
    if (groupBy === "status") {
      return (["open", "in_progress", "done"] as const).map((status) => ({
        key: status,
        label: STATUS_LABEL[status],
        color: undefined,
        items: live.filter((task) => task.status === status),
      }));
    }
    const dates = [...new Set(live.map((task) => task.due_date ?? ""))].sort();
    return dates.map((date) => ({
      key: date || "none",
      label: date ? fmt(date) : "No due date",
      color: undefined,
      items: live.filter((task) => (task.due_date ?? "") === date),
    }));
  }, [taskList, projectList, groupBy]);

  return (
    <Screen onBack={() => router.back()} refreshing={projects.isRefetching} onRefresh={() => { projects.refetch(); tasks.refetch(); }}>
      <TabBar tabs={TABS} active={tab} onSelect={setTab} />
      <TabPanel>
        {tab === "board" ? (
          <>
            <Btn onPress={() => setProjectDraft(emptyProject())}>➕ New Project</Btn>
            {projectList.length === 0 ? <EmptyState icon="📁" text="No projects yet." /> : null}
            {projectList.map((project) => {
              const { done, total } = countFor(project.id);
              return (
                <Pressable
                  key={project.id}
                  accessibilityRole="button"
                  accessibilityLabel={project.name}
                  onPress={() => router.push(`/more/projects/${project.id}`)}
                  style={[
                    bevelStyle(t, "out"),
                    { padding: 8, borderLeftWidth: 6, borderLeftColor: project.color },
                  ]}
                >
                  <Txt variant="bold">
                    {project.name}
                    {project.status !== "active" ? ` (${project.status})` : ""}
                  </Txt>
                  <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
                    {done}/{total} tasks done
                    {project.target_date ? ` · 🎯 ${fmt(project.target_date)}` : ""}
                  </Txt>
                </Pressable>
              );
            })}
          </>
        ) : null}

        {tab === "all" ? (
          <>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Txt>Group by:</Txt>
              <View style={{ flex: 1 }}>
                <Select
                  title="Group by"
                  value={groupBy}
                  onChange={(v) => setGroupBy(v as typeof groupBy)}
                  options={[
                    { value: "project", label: "Project" },
                    { value: "due", label: "Due date" },
                    { value: "status", label: "Status" },
                  ]}
                />
              </View>
            </View>
            {groups.map((group) => (
              <View key={group.key} style={{ marginBottom: 8 }}>
                <TitleBar title={`${group.label} (${group.items.length})`} />
                <ListBox>
                  {group.items.length === 0 ? <EmptyState text="—" /> : null}
                  {group.items.map((task, i) => (
                    <ProjectTaskRow
                      key={task.id}
                      task={task}
                      project={projectFor(task.project_id)}
                      today={today}
                      showProject={groupBy !== "project"}
                      last={i === group.items.length - 1}
                      onToggle={() => toggleDone.mutate(task)}
                      onOpen={() => setTaskDraft({ ...task })}
                    />
                  ))}
                </ListBox>
              </View>
            ))}
          </>
        ) : null}

        {tab === "calendar" ? <ProjectCalendar tasks={taskList} projects={projectList} /> : null}
      </TabPanel>

      <ProjectDialog draft={projectDraft} onChange={setProjectDraft} onClose={() => setProjectDraft(null)} />
      <TaskPropertiesDialog
        draft={taskDraft}
        onChange={setTaskDraft}
        onClose={() => setTaskDraft(null)}
        projects={projectList}
      />
    </Screen>
  );
}

/** Month/week grid of project tasks, coloured by their project. */
function ProjectCalendar({ tasks, projects }: { tasks: Task[]; projects: Project[] }) {
  const [mode, setMode] = useState<"month" | "week">("month");
  const [anchor, setAnchor] = useState(todayISO());

  const items: CalItem[] = useMemo(
    () =>
      tasks
        .filter((task) => task.due_date)
        .map((task) => ({
          id: task.id,
          date: task.due_date!,
          label: task.title,
          done: task.status === "done",
          color: projects.find((p) => p.id === task.project_id)?.color ?? "#000080",
        })),
    [tasks, projects],
  );

  function shift(direction: 1 | -1) {
    if (mode === "week") return setAnchor(addDays(anchor, direction * 7));
    const [year, month] = anchor.split("-").map(Number);
    const d = new Date(year, month - 1 + direction, 1);
    setAnchor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`);
  }

  return (
    <Window title={fromISO(anchor).toLocaleDateString("en-US", { month: "long", year: "numeric" })} icon="📅">
      <View style={{ flexDirection: "row", gap: 6, marginBottom: 6 }}>
        <Btn small accessibilityLabel="Previous" onPress={() => shift(-1)}>
          ◀
        </Btn>
        <Btn small onPress={() => setAnchor(todayISO())}>
          Today
        </Btn>
        <Btn small accessibilityLabel="Next" onPress={() => shift(1)}>
          ▶
        </Btn>
        <View style={{ flex: 1 }} />
        <Btn small primary={mode === "week"} onPress={() => setMode("week")}>
          Week
        </Btn>
        <Btn small primary={mode === "month"} onPress={() => setMode("month")}>
          Month
        </Btn>
      </View>
      <CalendarGrid mode={mode} anchor={anchor} items={items} />
    </Window>
  );
}
