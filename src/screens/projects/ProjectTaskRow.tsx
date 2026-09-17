import React from "react";
import { View } from "react-native";
import { priorityTone } from "@/lib/taskUi";
import { fmt } from "@/lib/dates";
import type { Project, Task } from "@/lib/types";
import { useTheme } from "@/theme/useTheme";
import { Check, ListRow, Txt } from "@/ui";

/** One project task, with its project chip. Shared by the Projects tab and the All Tasks tab. */
export function ProjectTaskRow({
  task,
  project,
  today,
  showProject,
  last,
  onToggle,
  onOpen,
}: {
  task: Task;
  project?: Project;
  today: string;
  showProject?: boolean;
  last?: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const t = useTheme();
  const overdue = task.status !== "done" && !!task.due_date && task.due_date < today;
  return (
    <ListRow
      last={last}
      title={task.title}
      strike={task.status === "done"}
      onPress={onOpen}
      left={<Check checked={task.status === "done"} onChange={onToggle} accessibilityLabel={task.title} />}
      right={
        <>
          {showProject && project ? (
            <View
              style={{
                backgroundColor: project.color,
                paddingHorizontal: 4,
                paddingVertical: 1,
                maxWidth: 96,
                flexShrink: 1,
              }}
            >
              <Txt style={{ fontSize: t.metric.fontSmall, color: "#ffffff" }} numberOfLines={1}>
                {project.name}
              </Txt>
            </View>
          ) : null}
          <Txt variant={priorityTone(task.priority)} style={{ fontSize: t.metric.fontSmall }}>
            P{task.priority}
          </Txt>
          <Txt
            variant={overdue ? "danger" : "muted"}
            style={{ fontSize: t.metric.fontSmall, width: 72, textAlign: "right" }}
          >
            {task.due_date ? fmt(task.due_date) : "—"}
          </Txt>
        </>
      }
    />
  );
}
