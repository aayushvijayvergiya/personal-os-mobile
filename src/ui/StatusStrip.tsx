import React from "react";
import { View, useWindowDimensions } from "react-native";
import { useStats } from "@/data/stats";
import { useClock } from "@/hooks/useClock";
import { useTheme } from "@/theme/useTheme";
import { Txt } from "./Txt";

function Cell({ children, flex }: { children: React.ReactNode; flex?: number }) {
  const t = useTheme();
  return (
    <View
      style={{
        flex,
        borderWidth: 1,
        borderTopColor: t.color.dark,
        borderLeftColor: t.color.dark,
        borderBottomColor: t.color.light,
        borderRightColor: t.color.light,
        paddingHorizontal: 8,
        paddingVertical: 3,
        justifyContent: "center",
      }}
    >
      {children}
    </View>
  );
}

/** The persistent status bar: "Ready." · task/habit counts · date and time. */
export function StatusStrip() {
  const t = useTheme();
  const now = useClock();
  const stats = useStats();
  const { width } = useWindowDimensions();
  const roomy = width >= 360;

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 3,
        padding: 3,
        borderWidth: t.metric.bevel,
        borderRadius: t.metric.radius,
        borderTopColor: t.color.light,
        borderLeftColor: t.color.light,
        borderBottomColor: t.color.dark,
        borderRightColor: t.color.dark,
        backgroundColor: t.color.face,
      }}
    >
      {roomy ? (
        <Cell>
          <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
            Ready.
          </Txt>
        </Cell>
      ) : null}
      <Cell flex={1}>
        <Txt numberOfLines={1} style={{ fontSize: t.metric.fontSmall }}>
          {stats ?? "…"}
        </Txt>
      </Cell>
      <Cell>
        <Txt numberOfLines={1} variant="muted" style={{ fontSize: t.metric.fontSmall }}>
          {now}
        </Txt>
      </Cell>
    </View>
  );
}
