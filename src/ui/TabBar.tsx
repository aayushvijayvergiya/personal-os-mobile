import React from "react";
import { Pressable, ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { bevelStyle } from "./Bevel";
import { Txt } from "./Txt";

export interface TabDef {
  key: string;
  label: string;
}

/** Horizontal tab strip. The selected tab is raised; the others sit sunken behind it. */
export function TabBar({
  tabs,
  active,
  onSelect,
}: {
  tabs: TabDef[];
  active: string;
  onSelect: (key: string) => void;
}) {
  const t = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Without this a horizontal ScrollView expands to fill a column layout.
      style={{ flexGrow: 0, flexShrink: 0 }}
      contentContainerStyle={{ gap: 3, paddingHorizontal: 2 }}
    >
      {tabs.map((tab) => {
        const on = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onSelect(tab.key)}
            style={[
              bevelStyle(t, on ? "out" : "in"),
              {
                minHeight: 38,
                paddingHorizontal: 12,
                justifyContent: "center",
                backgroundColor: on ? t.color.face : t.color.desk,
              },
            ]}
          >
            <Txt variant={on ? "bold" : "muted"} style={{ fontSize: t.metric.fontSmall }}>
              {tab.label}
            </Txt>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** The panel a TabBar sits above. */
export function TabPanel({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[bevelStyle(t, "out"), { padding: 10, gap: t.metric.gap }, style]}>{children}</View>;
}
