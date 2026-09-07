import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useGoals } from "@/data/goals";
import { useVisionItems, useVisionMutations } from "@/data/visionItems";
import type { VisionItem } from "@/lib/types";
import { useTheme } from "@/theme/useTheme";
import { Btn, Dialog, FieldRow, Input, Screen, Select, TextArea, Txt, Window } from "@/ui";
import { CorkBackground, VisionCard } from "./VisionCard";

const CANVAS = 1600;
const NOTE_COLORS = ["#ffffe1", "#e1ffe1", "#e1f0ff", "#ffe1f0", "#fff0d0"];

const TYPE_OPTS = [
  { value: "note", label: "Sticky note" },
  { value: "image", label: "Image (URL)" },
  { value: "goal", label: "Goal card" },
  { value: "list", label: "List (e.g. Non-Negotiables)" },
];

export function VisionScreen() {
  const router = useRouter();
  const t = useTheme();
  const items = useVisionItems();
  const goals = useGoals();
  const { create, move, updateContent, remove } = useVisionMutations();

  const [adding, setAdding] = useState<{ x: number; y: number } | null>(null);
  const [kind, setKind] = useState<VisionItem["item_type"]>("note");
  const [text, setText] = useState("");
  const [goalId, setGoalId] = useState("");

  const list = items.data ?? [];
  const goalList = goals.data ?? [];

  function openAdd(x: number, y: number) {
    setKind("note");
    setText("");
    setGoalId(goalList[0]?.id ?? "");
    setAdding({ x: Math.max(0, x - 100), y: Math.max(0, y - 40) });
  }

  /** Long-pressing empty board space pins something there. */
  const addGesture = Gesture.LongPress()
    .minDuration(300)
    .onStart((event) => {
      runOnJS(openAdd)(event.x, event.y);
    });

  function pin() {
    if (!adding) return;
    const content: VisionItem["content"] =
      kind === "note"
        ? { text, color: NOTE_COLORS[list.length % NOTE_COLORS.length] }
        : kind === "image"
          ? { url: text, caption: "" }
          : kind === "goal"
            ? { goal_id: goalId }
            : { title: text || "Non-Negotiables", items: [] };

    create.mutate({
      item_type: kind,
      content,
      pos_x: adding.x,
      pos_y: adding.y,
      rotation: Math.random() * 6 - 3,
      z_index: list.length + 1,
    });
    setAdding(null);
  }

  /** Persist a drag and bring the card to the front. */
  function handleMoved(id: string, x: number, y: number) {
    const topZ = list.reduce((max, item) => Math.max(max, item.z_index), 0);
    move.mutate({ id, pos_x: x, pos_y: y, z_index: topZ + 1 });
  }

  return (
    <Screen scroll={false} onBack={() => router.back()}>
      <Window
        title="Vision Board"
        icon="🌄"
        style={{ flex: 1, minHeight: 0 }}
        bodyStyle={{ flex: 1, minHeight: 0, padding: 0 }}
      >
        <Txt variant="muted" style={{ fontSize: t.metric.fontSmall, padding: 4 }}>
          Long-press the board to pin something. Long-press a card to drag it.
        </Txt>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ height: CANVAS }}>
          <ScrollView horizontal contentContainerStyle={{ width: CANVAS }}>
            <GestureDetector gesture={addGesture}>
              <View style={{ width: CANVAS, height: CANVAS, backgroundColor: t.color.cork }}>
                <CorkBackground size={CANVAS} stripe={t.color.corkStripe} />
                {list.length === 0 ? (
                  <Txt style={{ padding: 24, color: "#5a4a32" }}>
                    The corkboard is empty. Long-press anywhere to pin your first vision. 📌
                  </Txt>
                ) : null}
                {list.map((item) => (
                  <VisionCard
                    key={item.id}
                    item={item}
                    goal={
                      item.item_type === "goal"
                        ? goalList.find((g) => g.id === item.content.goal_id)
                        : undefined
                    }
                    onMoved={handleMoved}
                    onRemove={(id) => remove.mutate(id)}
                    onUpdateContent={(id, content) => updateContent.mutate({ id, content })}
                  />
                ))}
              </View>
            </GestureDetector>
          </ScrollView>
        </ScrollView>
      </Window>

      <Dialog
        title="Pin to Vision Board"
        icon="📌"
        open={!!adding}
        onClose={() => setAdding(null)}
        footer={
          <>
            <Btn small onPress={() => setAdding(null)}>
              Cancel
            </Btn>
            <Btn small primary onPress={pin}>
              Pin It
            </Btn>
          </>
        }
      >
        <FieldRow label="Type:">
          <Select
            title="Card type"
            value={kind}
            onChange={(v) => setKind(v as VisionItem["item_type"])}
            options={TYPE_OPTS}
          />
        </FieldRow>
        {kind === "note" ? (
          <FieldRow label="Text:">
            <TextArea rows={3} value={text} onChangeText={setText} />
          </FieldRow>
        ) : null}
        {kind === "image" ? (
          <FieldRow label="Image URL:">
            <Input
              value={text}
              onChangeText={setText}
              placeholder="https://…"
              autoCapitalize="none"
              keyboardType="url"
            />
          </FieldRow>
        ) : null}
        {kind === "list" ? (
          <FieldRow label="List title:">
            <Input value={text} onChangeText={setText} placeholder="Non-Negotiables" />
          </FieldRow>
        ) : null}
        {kind === "goal" ? (
          <FieldRow label="Goal:">
            <Select
              title="Goal"
              value={goalId}
              onChange={setGoalId}
              options={goalList.map((g) => ({ value: g.id, label: g.title }))}
            />
          </FieldRow>
        ) : null}
      </Dialog>
    </Screen>
  );
}
