import React from "react";
import { useFieldDefinitions } from "@/data/fieldDefinitions";
import type { CustomFields } from "@/lib/types";
import { DateField, FieldRow, Input, Select } from "@/ui";

/**
 * Renders the user-defined fields for tasks or goals. Values are stored on the row's
 * `custom_fields` jsonb keyed by definition id, exactly as the web app stores them.
 */
export function CustomFieldsEditor({
  entity,
  values,
  onChange,
}: {
  entity: "task" | "goal";
  values: CustomFields;
  onChange: (next: CustomFields) => void;
}) {
  const { data: defs = [] } = useFieldDefinitions(entity);
  if (defs.length === 0) return null;

  const set = (id: string, value: string | null) =>
    onChange({ ...values, [id]: value === "" ? null : value });

  return (
    <>
      {defs.map((def) => {
        const value = (values[def.id] as string | null) ?? null;
        return (
          <FieldRow key={def.id} label={`${def.name}:`}>
            {def.field_type === "select" ? (
              <Select
                title={def.name}
                value={value ?? ""}
                onChange={(v) => set(def.id, v)}
                options={[
                  { value: "", label: "—" },
                  ...(def.options ?? []).map((o) => ({ value: o, label: o })),
                ]}
              />
            ) : def.field_type === "date" ? (
              <DateField value={value} onChange={(v) => set(def.id, v)} allowClear title={def.name} />
            ) : (
              <Input
                value={value ?? ""}
                onChangeText={(v) => set(def.id, v)}
                keyboardType={def.field_type === "number" ? "numeric" : "default"}
                placeholder={def.field_type === "number" ? "0" : ""}
              />
            )}
          </FieldRow>
        );
      })}
    </>
  );
}
