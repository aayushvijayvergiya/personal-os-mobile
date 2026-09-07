import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { Txt } from "./Txt";

/** One row inside a sunken white list. Left slot is usually a Check, right slot metadata. */
export function ListRow({
  left,
  title,
  subtitle,
  right,
  onPress,
  strike,
  last,
}: {
  left?: React.ReactNode;
  title: string;
  subtitle?: string | null;
  right?: React.ReactNode;
  onPress?: () => void;
  strike?: boolean;
  last?: boolean;
}) {
  const t = useTheme();
  const body = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        minHeight: 48,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.color.desk,
      }}
    >
      {left}
      <View style={{ flex: 1, minWidth: 0, justifyContent: "center", minHeight: 34 }}>
        <Txt
          style={strike ? { textDecorationLine: "line-through", color: t.color.textMuted } : undefined}
        >
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="muted" numberOfLines={2} style={{ fontSize: t.metric.fontSmall, marginTop: 2 }}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right ? <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>{right}</View> : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress}>
      {body}
    </Pressable>
  );
}

/** The sunken white container ListRows live in. */
export function ListBox({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View
      style={{
        borderWidth: t.metric.bevel,
        borderRadius: t.metric.radius,
        borderTopColor: t.color.dark,
        borderLeftColor: t.color.dark,
        borderBottomColor: t.color.light,
        borderRightColor: t.color.light,
        backgroundColor: t.color.paper,
      }}
    >
      {children}
    </View>
  );
}
