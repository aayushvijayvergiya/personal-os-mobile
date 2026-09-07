import React from "react";
import { useProjectMutations } from "@/data/projects";
import type { Project } from "@/lib/types";
import { Btn, ColorSwatchPicker, DateField, Dialog, FieldRow, Input, Select, TextArea } from "@/ui";

const STATUS_OPTS = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

export function emptyProject(): Partial<Project> {
  return { name: "", color: "#000080", status: "active" };
}

export function ProjectDialog({
  draft,
  onChange,
  onClose,
}: {
  draft: Partial<Project> | null;
  onChange: (next: Partial<Project>) => void;
  onClose: () => void;
}) {
  const { save } = useProjectMutations();

  return (
    <Dialog
      title="Project Properties"
      icon="📁"
      open={!!draft}
      onClose={onClose}
      footer={
        <>
          <Btn small onPress={onClose}>
            Cancel
          </Btn>
          <Btn
            small
            primary
            onPress={() => {
              if (!draft?.name?.trim()) return;
              save.mutate(draft);
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
          <FieldRow label="Name:">
            <Input value={draft.name ?? ""} onChangeText={(name) => onChange({ ...draft, name })} />
          </FieldRow>
          <FieldRow label="Colour:">
            <ColorSwatchPicker
              value={draft.color ?? "#000080"}
              onChange={(color) => onChange({ ...draft, color })}
            />
          </FieldRow>
          <FieldRow label="Status:">
            <Select
              title="Status"
              value={draft.status ?? "active"}
              onChange={(status) => onChange({ ...draft, status: status as Project["status"] })}
              options={STATUS_OPTS}
            />
          </FieldRow>
          <FieldRow label="Target date:">
            <DateField
              value={draft.target_date ?? null}
              onChange={(target_date) => onChange({ ...draft, target_date })}
              allowClear
              title="Target date"
            />
          </FieldRow>
          <FieldRow label="Description:">
            <TextArea
              rows={3}
              value={draft.description ?? ""}
              onChangeText={(description) => onChange({ ...draft, description })}
            />
          </FieldRow>
        </>
      ) : null}
    </Dialog>
  );
}
