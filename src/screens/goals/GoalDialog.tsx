import React from "react";
import { Alert } from "react-native";
import { useGoalMutations } from "@/data/goals";
import { todayISO } from "@/lib/dates";
import { currentValues } from "@/lib/horizons";
import type { Category, CustomFields, Goal, GoalStatus, HorizonType } from "@/lib/types";
import {
  Btn,
  DateField,
  Dialog,
  FieldRow,
  Input,
  MonthField,
  QuarterField,
  Select,
  TextArea,
  YearField,
} from "@/ui";
import { CustomFieldsEditor } from "../shared/CustomFieldsEditor";

const HORIZON_OPTS = [
  { value: "date", label: "Specific date" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
];

const STATUS_OPTS = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

/** A blank goal aimed at the current month, matching the web app's default. */
export function emptyGoal(today: string): Partial<Goal> {
  return {
    title: "",
    description: "",
    horizon_type: "month",
    horizon_value: currentValues(today).month,
    category_id: null,
    status: "not_started",
    custom_fields: {},
  };
}

/** Default period for a horizon type — used when the type changes. */
function defaultValueFor(type: HorizonType, today: string): string {
  if (type === "date") return today;
  return currentValues(today)[type];
}

export function GoalDialog({
  draft,
  onChange,
  onClose,
  categories,
}: {
  draft: Partial<Goal> | null;
  onChange: (next: Partial<Goal>) => void;
  onClose: () => void;
  categories: Category[];
}) {
  const today = todayISO();
  const { save, remove } = useGoalMutations();

  function confirmDelete() {
    if (!draft?.id) return;
    const { id, title } = draft;
    Alert.alert("Delete goal", `Delete “${title}” permanently?`, [
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

  const horizonType = (draft?.horizon_type ?? "month") as HorizonType;
  const horizonValue = draft?.horizon_value ?? "";

  return (
    <Dialog
      title="Goal Properties"
      icon="🎯"
      open={!!draft}
      onClose={onClose}
      footer={
        <>
          {draft?.id ? (
            <Btn small onPress={confirmDelete}>
              Delete
            </Btn>
          ) : null}
          <Btn small onPress={onClose}>
            Cancel
          </Btn>
          <Btn
            small
            primary
            onPress={() => {
              if (!draft?.title?.trim()) return;
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
          <FieldRow label="Title:">
            <Input value={draft.title ?? ""} onChangeText={(title) => onChange({ ...draft, title })} />
          </FieldRow>
          <FieldRow label="Horizon:">
            <Select
              title="Horizon"
              value={horizonType}
              options={HORIZON_OPTS}
              onChange={(v) => {
                const type = v as HorizonType;
                onChange({ ...draft, horizon_type: type, horizon_value: defaultValueFor(type, today) });
              }}
            />
          </FieldRow>
          <FieldRow label="When:">
            {horizonType === "date" ? (
              <DateField
                value={horizonValue || today}
                onChange={(v) => onChange({ ...draft, horizon_value: v ?? today })}
                title="Goal date"
              />
            ) : horizonType === "month" ? (
              <MonthField
                value={horizonValue}
                onChange={(horizon_value) => onChange({ ...draft, horizon_value })}
              />
            ) : horizonType === "quarter" ? (
              <QuarterField
                value={horizonValue}
                onChange={(horizon_value) => onChange({ ...draft, horizon_value })}
              />
            ) : (
              <YearField
                value={horizonValue}
                onChange={(horizon_value) => onChange({ ...draft, horizon_value })}
              />
            )}
          </FieldRow>
          <FieldRow label="Category:">
            <Select
              title="Category"
              value={draft.category_id ?? ""}
              onChange={(v) => onChange({ ...draft, category_id: v || null })}
              options={[
                { value: "", label: "— none —" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </FieldRow>
          <FieldRow label="Status:">
            <Select
              title="Status"
              value={draft.status ?? "not_started"}
              onChange={(status) => onChange({ ...draft, status: status as GoalStatus })}
              options={STATUS_OPTS}
            />
          </FieldRow>
          <FieldRow label="Description:">
            <TextArea
              rows={3}
              value={draft.description ?? ""}
              onChangeText={(description) => onChange({ ...draft, description })}
            />
          </FieldRow>
          <CustomFieldsEditor
            entity="goal"
            values={draft.custom_fields ?? {}}
            onChange={(custom_fields: CustomFields) => onChange({ ...draft, custom_fields })}
          />
        </>
      ) : null}
    </Dialog>
  );
}
