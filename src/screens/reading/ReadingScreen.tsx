import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, Pressable, View } from "react-native";
import { useBookMutations, useBooks } from "@/data/books";
import { fmt, todayISO } from "@/lib/dates";
import { isOverdue, sortReadingItems } from "@/lib/reading";
import type { Book } from "@/lib/types";
import { useTheme } from "@/theme/useTheme";
import {
  Btn,
  DateField,
  Dialog,
  EmptyState,
  FieldRow,
  Input,
  Screen,
  TabBar,
  TabPanel,
  TextArea,
  Txt,
  bevelStyle,
} from "@/ui";

const KINDS = [
  { key: "book", label: "📚 Books" },
  { key: "article", label: "📰 Articles" },
];
const BOOK_SHELVES = [
  { key: "to_read", label: "📕 To Read" },
  { key: "reading", label: "📖 Reading" },
  { key: "finished", label: "✅ Finished" },
];
const ARTICLE_SHELVES = [
  { key: "to_read", label: "📰 To Read" },
  { key: "finished", label: "✅ Read" },
];

function stars(n: number | null): string {
  return n ? "★".repeat(n) + "☆".repeat(5 - n) : "";
}

export function ReadingScreen() {
  const router = useRouter();
  const t = useTheme();
  const today = todayISO();
  const [kind, setKind] = useState<Book["item_type"]>("book");
  const [bookShelf, setBookShelf] = useState("to_read");
  const [articleShelf, setArticleShelf] = useState("to_read");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [link, setLink] = useState("");
  const [due, setDue] = useState<string | null>(null);
  const [finishing, setFinishing] = useState<Book | null>(null);
  const [editing, setEditing] = useState<Book | null>(null);

  const books = useBooks();
  const { create, move, finish, update, remove } = useBookMutations();

  function add() {
    if (!title.trim()) return;
    create.mutate({ title, item_type: kind, author, link, due_date: due });
    setTitle("");
    setAuthor("");
    setLink("");
    setDue(null);
  }

  /** Finishing a book opens the rating dialog; every other move writes straight away. */
  function moveTo(item: Book, status: Book["status"]) {
    if (status === "finished" && item.item_type === "book") {
      setFinishing({ ...item, rating: item.rating ?? 4 });
      return;
    }
    move.mutate({ item, status });
  }

  function confirmDelete(item: Book) {
    Alert.alert("Delete", `Delete this ${item.item_type}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          remove.mutate(item.id);
          setEditing(null);
        },
      },
    ]);
  }

  const shelf = kind === "book" ? bookShelf : articleShelf;
  const visible = sortReadingItems(
    (books.data ?? []).filter((b) => b.item_type === kind && b.status === shelf),
  );

  return (
    <Screen onBack={() => router.back()} refreshing={books.isRefetching} onRefresh={books.refetch}>
      <TabBar tabs={KINDS} active={kind} onSelect={(k) => setKind(k as Book["item_type"])} />
      <TabPanel>
        <Input
          placeholder={kind === "book" ? "Book title…" : "Article title…"}
          value={title}
          onChangeText={setTitle}
        />
        {kind === "book" ? (
          <Input placeholder="Author (optional)…" value={author} onChangeText={setAuthor} />
        ) : (
          <Input
            placeholder="Link (optional)…"
            value={link}
            onChangeText={setLink}
            autoCapitalize="none"
            keyboardType="url"
          />
        )}
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <DateField value={due} onChange={setDue} allowClear title="Due date" placeholder="No due date" />
          </View>
          <Btn primary onPress={add}>
            Add
          </Btn>
        </View>

        <TabBar
          tabs={kind === "book" ? BOOK_SHELVES : ARTICLE_SHELVES}
          active={shelf}
          onSelect={kind === "book" ? setBookShelf : setArticleShelf}
        />

        {visible.length === 0 ? <EmptyState icon="📚" text="This shelf is empty." /> : null}
        {visible.map((item) => (
          <View key={item.id} style={[bevelStyle(t, "in"), { padding: 8, gap: 6 }]}>
            <Pressable accessibilityRole="button" onPress={() => setEditing({ ...item })}>
              <Txt variant="bold">{item.title}</Txt>
              {item.author ? <Txt variant="muted">— {item.author}</Txt> : null}
              {item.status === "finished" && item.item_type === "book" && item.rating ? (
                <Txt style={{ color: "#b8860b" }}>{stars(item.rating)}</Txt>
              ) : null}
              {item.due_date ? (
                <Txt
                  variant={isOverdue(item, today) ? "danger" : "muted"}
                  style={{ fontSize: t.metric.fontSmall }}
                >
                  due {fmt(item.due_date)}
                </Txt>
              ) : null}
            </Pressable>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              {item.link ? (
                <Btn small accessibilityLabel="Open link" onPress={() => Linking.openURL(item.link!)}>
                  link
                </Btn>
              ) : null}
              <View style={{ flex: 1 }} />
              {item.item_type === "book" ? (
                <>
                  {item.status !== "to_read" ? (
                    <Btn small onPress={() => moveTo(item, "to_read")}>
                      To Read
                    </Btn>
                  ) : null}
                  {item.status !== "reading" ? (
                    <Btn small onPress={() => moveTo(item, "reading")}>
                      Reading
                    </Btn>
                  ) : null}
                  {item.status !== "finished" ? (
                    <Btn small onPress={() => moveTo(item, "finished")}>
                      Finish…
                    </Btn>
                  ) : null}
                </>
              ) : (
                <Btn
                  small
                  onPress={() => moveTo(item, item.status === "finished" ? "to_read" : "finished")}
                >
                  {item.status === "finished" ? "To Read" : "Mark Read"}
                </Btn>
              )}
            </View>
          </View>
        ))}
      </TabPanel>

      <Dialog
        title="Finish Book"
        icon="✅"
        open={!!finishing}
        onClose={() => setFinishing(null)}
        footer={
          <>
            <Btn small onPress={() => setFinishing(null)}>
              Cancel
            </Btn>
            <Btn
              small
              primary
              onPress={() => {
                if (finishing) {
                  finish.mutate({
                    id: finishing.id,
                    rating: finishing.rating,
                    takeaways: finishing.takeaways,
                  });
                }
                setFinishing(null);
              }}
            >
              Finish Book
            </Btn>
          </>
        }
      >
        {finishing ? (
          <>
            <Txt variant="bold">{finishing.title}</Txt>
            <FieldRow label="Rating:">
              <View style={{ flexDirection: "row", gap: 4 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Btn
                    key={n}
                    small
                    primary={finishing.rating === n}
                    accessibilityLabel={`${n} stars`}
                    onPress={() => setFinishing({ ...finishing, rating: n })}
                  >
                    {`${n}★`}
                  </Btn>
                ))}
              </View>
            </FieldRow>
            <FieldRow label="Takeaways:">
              <TextArea
                rows={4}
                value={finishing.takeaways ?? ""}
                onChangeText={(takeaways) => setFinishing({ ...finishing, takeaways })}
              />
            </FieldRow>
          </>
        ) : null}
      </Dialog>

      <Dialog
        title={editing?.item_type === "article" ? "Article Properties" : "Book Properties"}
        icon="📚"
        open={!!editing}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Btn small onPress={() => editing && confirmDelete(editing)}>
              Delete
            </Btn>
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
              OK
            </Btn>
          </>
        }
      >
        {editing ? (
          <>
            <FieldRow label="Title:">
              <Input value={editing.title} onChangeText={(v) => setEditing({ ...editing, title: v })} />
            </FieldRow>
            {editing.item_type === "book" ? (
              <FieldRow label="Author:">
                <Input
                  value={editing.author ?? ""}
                  onChangeText={(v) => setEditing({ ...editing, author: v })}
                />
              </FieldRow>
            ) : null}
            <FieldRow label="Link:">
              <Input
                value={editing.link ?? ""}
                autoCapitalize="none"
                keyboardType="url"
                onChangeText={(v) => setEditing({ ...editing, link: v })}
              />
            </FieldRow>
            <FieldRow label="Due date:">
              <DateField
                value={editing.due_date}
                onChange={(due_date) => setEditing({ ...editing, due_date })}
                allowClear
                title="Due date"
              />
            </FieldRow>
            {editing.item_type === "book" && editing.status === "finished" ? (
              <>
                <FieldRow label="Rating:">
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Btn
                        key={n}
                        small
                        primary={editing.rating === n}
                        accessibilityLabel={`${n} stars`}
                        onPress={() => setEditing({ ...editing, rating: n })}
                      >
                        {`${n}★`}
                      </Btn>
                    ))}
                  </View>
                </FieldRow>
                <FieldRow label="Takeaways:">
                  <TextArea
                    rows={4}
                    value={editing.takeaways ?? ""}
                    onChangeText={(takeaways) => setEditing({ ...editing, takeaways })}
                  />
                </FieldRow>
              </>
            ) : null}
          </>
        ) : null}
      </Dialog>
    </Screen>
  );
}
