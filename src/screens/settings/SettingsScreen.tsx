import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { useTableCounts } from "@/data/counts";
import { useTheme } from "@/theme/useTheme";
import { EmptyState, Input, Screen, Txt, Window, bevelStyle } from "@/ui";
import { SETTINGS_SECTIONS, sectionMatches } from "./registry";

const COUNT_TABLES = SETTINGS_SECTIONS.map((s) => s.countTable).filter(
  (table): table is string => !!table,
);

export function SettingsScreen() {
  const t = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { data: counts = {} } = useTableCounts(COUNT_TABLES);

  const groups = useMemo(() => {
    const seen: string[] = [];
    for (const section of SETTINGS_SECTIONS) if (!seen.includes(section.group)) seen.push(section.group);
    return seen;
  }, []);

  const hits = SETTINGS_SECTIONS.filter((s) => sectionMatches(s, query)).length;

  return (
    <Screen onBack={() => router.back()}>
      <Window title="Control Panel" icon="⚙️">
        <Input placeholder="🔍 Search settings…" value={query} onChangeText={setQuery} />

        {groups.map((group) => {
          const sections = SETTINGS_SECTIONS.filter(
            (s) => s.group === group && sectionMatches(s, query),
          );
          if (sections.length === 0) return null;
          return (
            <View key={group} style={{ marginTop: 10 }}>
              <Txt
                variant="bold"
                style={{
                  fontSize: t.metric.fontSmall,
                  borderBottomWidth: 1,
                  borderBottomColor: t.color.dark,
                  paddingBottom: 2,
                  marginBottom: 6,
                }}
              >
                {group.toUpperCase()}
              </Txt>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {sections.map((section) => {
                  const count = section.countTable ? counts[section.countTable] : undefined;
                  return (
                    <Pressable
                      key={section.id}
                      accessibilityRole="button"
                      accessibilityLabel={section.title}
                      accessibilityHint={section.description}
                      onPress={() => router.push(`/more/settings/${section.id}`)}
                      style={({ pressed }) => [
                        bevelStyle(t, pressed ? "in" : "out"),
                        {
                          width: "31%",
                          flexGrow: 1,
                          minHeight: 88,
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 6,
                          gap: 2,
                        },
                      ]}
                    >
                      <Txt style={{ fontSize: 26, lineHeight: 32 }}>{section.icon}</Txt>
                      <Txt variant="bold" style={{ fontSize: t.metric.fontSmall, textAlign: "center" }}>
                        {section.title}
                      </Txt>
                      <Txt variant="muted" style={{ fontSize: 10 }}>
                        {count != null ? `${count} item${count === 1 ? "" : "s"}` : " "}
                      </Txt>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        {hits === 0 ? <EmptyState icon="🔍" text={`No settings match “${query}”.`} /> : null}
      </Window>
    </Screen>
  );
}
