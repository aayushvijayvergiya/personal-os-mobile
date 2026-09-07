import React, { useState } from "react";
import { Alert, View } from "react-native";
import { useCategories, useCategoryMutations } from "@/data/goals";
import { useTheme } from "@/theme/useTheme";
import { Btn, ColorSwatchPicker, EmptyState, Input, Txt, bevelStyle } from "@/ui";

export function CategoriesPanel() {
  const t = useTheme();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000080");
  const categories = useCategories();
  const { create, remove } = useCategoryMutations();

  function add() {
    if (!name.trim()) return;
    create.mutate({ name, color });
    setName("");
  }

  function confirmDelete(id: string, label: string) {
    Alert.alert("Delete category", `Delete “${label}”? Goals keep their data but lose the category.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove.mutate(id) },
    ]);
  }

  const list = categories.data ?? [];

  return (
    <>
      {/* Add form, boxed so it reads as one unit separate from the list below. */}
      <View style={[bevelStyle(t, "out"), { padding: 10, gap: 10 }]}>
        <View style={{ gap: 4 }}>
          <Txt variant="small">Name</Txt>
          <Input
            placeholder="e.g. Health"
            value={name}
            onChangeText={setName}
            returnKeyType="done"
            onSubmitEditing={add}
          />
        </View>

        <View style={{ gap: 6 }}>
          <Txt variant="small">Colour</Txt>
          <ColorSwatchPicker value={color} onChange={setColor} />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Btn primary onPress={add}>
            Add category
          </Btn>
        </View>
      </View>

      <Txt variant="bold" style={{ fontSize: t.metric.fontSmall, marginTop: 14 }}>
        {list.length} {list.length === 1 ? "CATEGORY" : "CATEGORIES"}
      </Txt>

      {list.length === 0 ? <EmptyState icon="🏷️" text="No categories yet." /> : null}

      {list.map((category, i) => (
        <View
          key={category.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingVertical: 8,
            borderTopWidth: i === 0 ? 0 : 1,
            borderTopColor: t.color.dark,
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              backgroundColor: category.color,
              borderWidth: 1,
              borderColor: t.color.darker,
            }}
          />
          <Txt style={{ flex: 1 }} numberOfLines={1}>
            {category.name}
          </Txt>
          <Btn
            small
            accessibilityLabel={`Delete ${category.name}`}
            onPress={() => confirmDelete(category.id, category.name)}
          >
            Delete
          </Btn>
        </View>
      ))}
    </>
  );
}
