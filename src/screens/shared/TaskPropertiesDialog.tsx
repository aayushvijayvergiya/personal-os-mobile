import React from "react";
import { Alert } from "react-native";
import { useTaskMutations } from "@/data/tasks";
import { completedAtForDate, todayISO, toISO } from "@/lib/dates";
import { PRIORITY_OPTS } from "@/lib/taskUi";
import type { CustomFields, Project, Task } from "@/lib/types";
import { Btn, DateField, Dialog, FieldRow, Input, Select, TextArea } from "@/ui";
import { CustomFieldsEditor } from "./CustomFieldsEditor";

const STATUS_OPTS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

/**
 * The Task Properties window, shared by the Tasks module and the Projects module.
 * Fully controlled: the parent owns the draft (a copy of the row), so opening a different task
 * needs no state syncing here. Pass `projects` to show the project picker.
 */
export function TaskPropertiesDialog({
  draft,
  onChange,
  onClose,
  projects,
}: {
  draft: Task | null;
  onChange: (next: Task) => void;
  onClose: () => void;
  projects?: Project[];
}) {
  const { update, remove } = useTaskMutations();

  function confirmDelete() {
    if (!draft) return;
    const { id, title } = draft;
    Alert.alert("Delete task", `Delete “${title}” permanently?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          remove.mutate(id);
          onClose();
        },
      },
    ]);
  }

  return (
    <Dialog
      title="Task Properties"
      icon="📋"
      open={!!draft}
      onClose={onClose}
      footer={
        <>
          <Btn small onPress={confirmDelete}>
            Delete
          </Btn>
          <Btn small onPress={onClose}>
            Cancel
          </Btn>
          <Btn
            small
            primary
            onPress={() => {
              if (draft) update.mutate(draft);
              onClose();
            }}
          >
            OK
          </Btn>
        </>
      }
    >
      {draft ? (
        <>
          <FieldRow label="Title:">
            <Input value={draft.title} onChangeText={(title) => onChange({ ...draft, title })} />
          </FieldRow>
          {projects ? (
            <FieldRow label="Project:">
              <Select
                title="Project"
                value={draft.project_id ?? ""}
                onChange={(project_id) => onChange({ ...draft, project_id })}
                options={projects.map((p) => ({ value: p.id, label: p.name }))}
              />
            </FieldRow>
          ) : null}
          <FieldRow label="Due date:">
            <DateField
              value={draft.due_date}
              onChange={(due_date) => onChange({ ...draft, due_date })}
              allowClear
              title="Due date"
            />
          </FieldRow>
          <FieldRow label="Priority:">
            <Select
              title="Priority"
              value={String(draft.priority)}
              onChange={(p) => onChange({ ...draft, priority: Number(p) })}
              options={PRIORITY_OPTS}
            />
          </FieldRow>
          <FieldRow label="Status:">
            <Select
              title="Status"
              value={draft.status}
              onChange={(status) => onChange({ ...draft, status: status as Task["status"] })}
              options={STATUS_OPTS}
            />
          </FieldRow>
          {draft.status === "done" ? (
            <FieldRow label="Completed:">
              <DateField
                value={draft.completed_at ? toISO(new Date(draft.completed_at)) : todayISO()}
                onChange={(date) =>
                  date && onChange({ ...draft, completed_at: completedAtForDate(draft.completed_at, date) })
                }
                title="Completed date"
              />
            </FieldRow>
          ) : null}
          <FieldRow label="Description:">
            <TextArea
              rows={3}
              value={draft.description ?? ""}
              onChangeText={(description) => onChange({ ...draft, description })}
            />
          </FieldRow>
          <CustomFieldsEditor
            entity="task"
            values={draft.custom_fields}
            onChange={(custom_fields: CustomFields) => onChange({ ...draft, custom_fields })}
          />
        </>
      ) : null}
    </Dialog>
  );
}
