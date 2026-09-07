import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import { useProjects } from "@/data/projects";
import { useProjectTasks, useTaskMutations } from "@/data/tasks";
import { todayISO } from "@/lib/dates";
import type { Project, Task } from "@/lib/types";
import { Btn, EmptyState, Input, ListBox, Screen, Txt, Window } from "@/ui";
import { TaskPropertiesDialog } from "../shared/TaskPropertiesDialog";
import { ProjectDialog } from "./ProjectDialog";
import { ProjectTaskRow } from "./ProjectTaskRow";

export function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const today = todayISO();
  const [title, setTitle] = useState("");
  const [projectDraft, setProjectDraft] = useState<Partial<Project> | null>(null);
  const [taskDraft, setTaskDraft] = useState<Task | null>(null);

  const projects = useProjects();
  const tasks = useProjectTasks();
  const { create, toggleDone } = useTaskMutations();

  const project = (projects.data ?? []).find((p) => p.id === id);
  const projectTasks = (tasks.data ?? []).filter((task) => task.project_id === id);

  function addTask() {
    if (!title.trim() || !id) return;
    create.mutate({ title, project_id: id });
    setTitle("");
  }

  if (!project) {
    return (
      <Screen onBack={() => router.back()}>
        <Window title="Project" icon="📁">
          <EmptyState
            icon="📁"
            text={projects.isLoading ? "Loading…" : "This project no longer exists."}
          />
        </Window>
      </Screen>
    );
  }

  return (
    <Screen onBack={() => router.back()} refreshing={tasks.isRefetching} onRefresh={tasks.refetch}>
      <Window
        title={project.name}
        icon="📁"
        actions={
<Btn small onPress={() => setProjectDraft({ ...project })}>
            Properties
          </Btn>
        }
      >
        {project.description ? <Txt variant="muted">{project.description}</Txt> : null}
        <View style={{ flexDirection: "row", gap: 6, marginVertical: 6 }}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="New task in this project…"
              value={title}
              onChangeText={setTitle}
              returnKeyType="done"
              onSubmitEditing={addTask}
            />
          </View>
          <Btn primary onPress={addTask}>
            Add
          </Btn>
        </View>
        <ListBox>
          {projectTasks.length === 0 ? <EmptyState text="No tasks in this project." /> : null}
          {projectTasks.map((task, i) => (
            <ProjectTaskRow
              key={task.id}
              task={task}
              project={project}
              today={today}
              last={i === projectTasks.length - 1}
              onToggle={() => toggleDone.mutate(task)}
              onOpen={() => setTaskDraft({ ...task })}
            />
          ))}
        </ListBox>
      </Window>

      <ProjectDialog draft={projectDraft} onChange={setProjectDraft} onClose={() => setProjectDraft(null)} />
      <TaskPropertiesDialog
        draft={taskDraft}
        onChange={setTaskDraft}
        onClose={() => setTaskDraft(null)}
        projects={projects.data ?? []}
      />
    </Screen>
  );
}
