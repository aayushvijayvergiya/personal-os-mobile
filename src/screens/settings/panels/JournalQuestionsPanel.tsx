import React, { useState } from "react";
import { Alert, View } from "react-native";
import { useAllJournalQuestions, useJournalQuestionMutations } from "@/data/journal";
import type { JournalType } from "@/lib/types";
import { useTheme } from "@/theme/useTheme";
import { Btn, EmptyState, FieldRow, Input, Select, Txt } from "@/ui";

export function JournalQuestionsPanel() {
  const t = useTheme();
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<JournalType>("daily");
  const questions = useAllJournalQuestions();
  const { create, setActive, remove } = useJournalQuestionMutations();

  function add() {
    if (!prompt.trim()) return;
    const group = (questions.data ?? []).filter((q) => q.journal_type === type);
    const sortOrder = group.reduce((max, q) => Math.max(max, q.sort_order), -1) + 1;
    create.mutate({ prompt, journalType: type, sortOrder });
    setPrompt("");
  }

  function confirmDelete(id: string) {
    Alert.alert("Delete question", "Delete this question? Past answers stay in their entries.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove.mutate(id) },
    ]);
  }

  return (
    <>
      <FieldRow label="New question:">
        <Input
          placeholder="New reflection question…"
          value={prompt}
          onChangeText={setPrompt}
          returnKeyType="done"
          onSubmitEditing={add}
        />
      </FieldRow>
      <FieldRow label="Journal:">
        <Select
          title="Journal type"
          value={type}
          onChange={(v) => setType(v as JournalType)}
          options={[
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
          ]}
        />
      </FieldRow>
      <Btn primary onPress={add}>
        Add
      </Btn>

      {(["daily", "weekly"] as const).map((journalType) => {
        const group = (questions.data ?? []).filter((q) => q.journal_type === journalType);
        return (
          <View key={journalType} style={{ gap: 4, marginTop: 8 }}>
            <Txt variant="bold" style={{ fontSize: t.metric.fontSmall }}>
              {journalType === "daily" ? "DAILY" : "WEEKLY"}
            </Txt>
            {group.length === 0 ? <EmptyState text="None yet." /> : null}
            {group.map((question) => (
              <View key={question.id} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Txt
                  style={[
                    { flex: 1 },
                    question.active ? null : { textDecorationLine: "line-through", color: t.color.textMuted },
                  ]}
                >
                  {question.prompt}
                </Txt>
                <Btn
                  small
                  onPress={() => setActive.mutate({ id: question.id, active: !question.active })}
                >
                  {question.active ? "Disable" : "Enable"}
                </Btn>
                <Btn small onPress={() => confirmDelete(question.id)}>
                  Delete
                </Btn>
              </View>
            ))}
          </View>
        );
      })}
    </>
  );
}
