import React, { useState } from "react";
import { Alert, View } from "react-native";
import { useAllFieldDefinitions, useFieldDefinitionMutations } from "@/data/fieldDefinitions";
import type { FieldDefinition } from "@/lib/types";
import { useTheme } from "@/theme/useTheme";
import { Btn, EmptyState, FieldRow, Input, Select, Txt, showToast } from "@/ui";

const TYPE_OPTS = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select" },
];

export function CustomFieldsPanel() {
  const t = useTheme();
  const [name, setName] = useState("");
  const [entity, setEntity] = useState<"task" | "goal">("task");
  const [fieldType, setFieldType] = useState<FieldDefinition["field_type"]>("text");
  const [options, setOptions] = useState("");

  const fields = useAllFieldDefinitions();
  const { create, remove } = useFieldDefinitionMutations();

  function add() {
    if (!name.trim()) return;
    if (fieldType === "select" && !options.trim()) {
      showToast("Give comma-separated options for a select field.");
      return;
    }
    const group = (fields.data ?? []).filter((f) => f.entity === entity);
    const sortOrder = group.reduce((max, f) => Math.max(max, f.sort_order), -1) + 1;
    create.mutate({
      entity,
      name,
      field_type: fieldType,
      options:
        fieldType === "select"
          ? options.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
      sort_order: sortOrder,
    });
    setName("");
    setOptions("");
  }

  function confirmDelete(id: string) {
    Alert.alert("Delete field", "Delete this field definition? Its values remain in existing rows.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove.mutate(id) },
    ]);
  }

  return (
    <>
      <FieldRow label="Field name:">
        <Input placeholder="Field name…" value={name} onChangeText={setName} />
      </FieldRow>
      <FieldRow label="Applies to:">
        <Select
          title="Entity"
          value={entity}
          onChange={(v) => setEntity(v as "task" | "goal")}
          options={[
            { value: "task", label: "Task" },
            { value: "goal", label: "Goal" },
          ]}
        />
      </FieldRow>
      <FieldRow label="Type:">
        <Select
          title="Field type"
          value={fieldType}
          onChange={(v) => setFieldType(v as FieldDefinition["field_type"])}
          options={TYPE_OPTS}
        />
      </FieldRow>
      {fieldType === "select" ? (
        <FieldRow label="Options:">
          <Input placeholder="Options, comma-separated" value={options} onChangeText={setOptions} />
        </FieldRow>
      ) : null}
      <Btn primary onPress={add}>
        Add
      </Btn>

      {(fields.data ?? []).length === 0 ? <EmptyState text="No custom fields defined." /> : null}
      {(fields.data ?? []).map((field) => (
        <View key={field.id} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Txt variant="small" style={{ backgroundColor: t.color.paper, paddingHorizontal: 4 }}>
            {field.entity}
          </Txt>
          <Txt style={{ flex: 1 }}>
            {field.name}{" "}
            <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
              ({field.field_type}
              {field.options ? `: ${field.options.join(", ")}` : ""})
            </Txt>
          </Txt>
          <Btn small onPress={() => confirmDelete(field.id)}>
            Delete
          </Btn>
        </View>
      ))}
      <Txt variant="muted" style={{ fontSize: t.metric.fontSmall, marginTop: 6 }}>
        Custom fields appear in the Task and Goal property dialogs.
      </Txt>
    </>
  );
}
