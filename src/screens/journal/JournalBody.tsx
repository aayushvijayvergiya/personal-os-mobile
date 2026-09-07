import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { useJournalMutations } from "@/data/journal";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import type { JournalEntry, JournalQuestion, JournalType } from "@/lib/types";
import { useTheme } from "@/theme/useTheme";
import { EmptyState, TextArea, Txt, Window } from "@/ui";

const SAVE_DELAY_MS = 600;

/**
 * Owns the editable state of one journal entry.
 * The parent mounts this with a `key` of type+date, so switching day resets the draft without
 * any state-syncing effect.
 */
export function JournalBody({
  entry,
  questions,
  type,
  date,
  heading,
}: {
  entry: JournalEntry;
  questions: JournalQuestion[];
  type: JournalType;
  date: string;
  heading: string;
}) {
  const t = useTheme();
  const { save } = useJournalMutations(type, date);
  const [draft, setDraft] = useState<JournalEntry>(entry);
  const debouncedSave = useDebouncedCallback((next: JournalEntry) => save.mutate(next), SAVE_DELAY_MS);

  /** Typing updates the draft immediately and schedules a write. */
  function edit(patch: Partial<JournalEntry>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    debouncedSave(next);
  }

  /** Stars save straight away — there is nothing to debounce. */
  function rate(value: number) {
    const next = { ...draft, day_rating: value };
    setDraft(next);
    save.mutate(next);
  }

  const period = type === "daily" ? "day" : "week";
  const answered = questions.filter((q) => (draft.answers[q.id] ?? "").trim().length > 0).length;

  return (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
          ⭐
        </Txt>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${n} star${n > 1 ? "s" : ""}`}
            accessibilityState={{ selected: draft.day_rating === n }}
            hitSlop={6}
            onPress={() => rate(n)}
          >
            <Txt style={{ fontSize: 20, lineHeight: 24 }}>{(draft.day_rating ?? 0) >= n ? "★" : "☆"}</Txt>
          </Pressable>
        ))}
        <View style={{ flex: 1 }} />
        <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
          {save.isPending ? "Saving…" : "Saved"}
        </Txt>
      </View>

      <Window
        title={`Journal — ${heading}`}
        icon="📖"
        actions={
          <Txt variant="title">
            {answered} / {questions.length} answered
          </Txt>
        }
        bodyStyle={{ backgroundColor: t.color.paper, gap: 12 }}
      >
        {questions.length === 0 ? (
          <EmptyState text="No questions configured (see Settings)." />
        ) : null}
        {questions.map((question) => (
          <View key={question.id} style={{ gap: 2 }}>
            <Txt variant="bold" style={{ fontSize: t.metric.fontSmall, color: t.color.link }}>
              {question.prompt}
            </Txt>
            <TextArea
              rows={3}
              accessibilityLabel={question.prompt}
              value={draft.answers[question.id] ?? ""}
              onChangeText={(text) => edit({ answers: { ...draft.answers, [question.id]: text } })}
            />
          </View>
        ))}
        <View style={{ gap: 2 }}>
          <Txt variant="bold" style={{ fontSize: t.metric.fontSmall, color: t.color.link }}>
            Notes from the {period}
          </Txt>
          <TextArea
            rows={8}
            accessibilityLabel={`Notes from the ${period}`}
            value={draft.notes}
            onChangeText={(notes) => edit({ notes })}
          />
        </View>
      </Window>
    </>
  );
}
