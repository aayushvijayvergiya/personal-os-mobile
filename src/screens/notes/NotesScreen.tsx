import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, View } from "react-native";
import { useNoteMutations, useNotes } from "@/data/notes";
import type { Note } from "@/lib/types";
import { useTheme } from "@/theme/useTheme";
import { Btn, Dialog, EmptyState, FieldRow, Input, Screen, TextArea, Txt, Window, bevelStyle } from "@/ui";

export function NotesScreen() {
  const router = useRouter();
  const t = useTheme();
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Note | null>(null);

  const notes = useNotes();
  const { create, update, togglePin, remove } = useNoteMutations();

  function add() {
    if (!body.trim()) return;
    create.mutate(body);
    setBody("");
  }

  function confirmDelete(note: Note) {
    Alert.alert("Delete note", "Delete this note permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          remove.mutate(note.id);
          setEditing(null);
        },
      },
    ]);
  }

  const query = search.trim().toLowerCase();
  const visible = (notes.data ?? []).filter(
    (note) => !query || `${note.body} ${note.title ?? ""}`.toLowerCase().includes(query),
  );

  return (
    <Screen onBack={() => router.back()} refreshing={notes.isRefetching} onRefresh={notes.refetch}>
      <Window title="Quick Capture" icon="🗒️">
        <TextArea
          rows={4}
          placeholder="Jot something down…"
          accessibilityLabel="New note"
          value={body}
          onChangeText={setBody}
        />
        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 6 }}>
          <Btn primary onPress={add}>
            Add
          </Btn>
        </View>
      </Window>

      <Window title="Notes" icon="📌">
        <Input placeholder="🔍 Search…" value={search} onChangeText={setSearch} />
        {visible.length === 0 ? <EmptyState icon="🗒️" text="No notes found." /> : null}
        {visible.map((note) => (
          <View
            key={note.id}
            style={[
              bevelStyle(t, "out"),
              { padding: 8, marginTop: 6, gap: 4, backgroundColor: note.pinned ? t.color.paperTint : t.color.face },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Txt variant="muted" style={{ flex: 1, fontSize: t.metric.fontSmall }}>
                {new Date(note.created_at).toLocaleDateString()}
              </Txt>
              <Btn
                small
                accessibilityLabel={note.pinned ? `Unpin note` : `Pin note`}
                onPress={() => togglePin.mutate(note)}
              >
                {note.pinned ? "📌" : "📍"}
              </Btn>
              <Btn small accessibilityLabel="Edit note" onPress={() => setEditing({ ...note })}>
                ✏️
              </Btn>
              <Btn small accessibilityLabel="Delete note" onPress={() => confirmDelete(note)}>
                🗑️
              </Btn>
            </View>
            {note.title ? <Txt variant="bold">{note.title}</Txt> : null}
            <Txt>{note.body}</Txt>
          </View>
        ))}
      </Window>

      <Dialog
        title="Edit Note"
        icon="✏️"
        open={!!editing}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Btn small onPress={() => setEditing(null)}>
              Cancel
            </Btn>
            <Btn
              small
              primary
              onPress={() => {
                if (editing) update.mutate(editing);
                setEditing(null);
              }}
            >
              Save
            </Btn>
          </>
        }
      >
        {editing ? (
          <>
            <FieldRow label="Title:">
              <Input
                value={editing.title ?? ""}
                onChangeText={(title) => setEditing({ ...editing, title })}
              />
            </FieldRow>
            <FieldRow label="Body:">
              <TextArea
                rows={5}
                value={editing.body}
                onChangeText={(bodyText) => setEditing({ ...editing, body: bodyText })}
              />
            </FieldRow>
          </>
        ) : null}
      </Dialog>
    </Screen>
  );
}
