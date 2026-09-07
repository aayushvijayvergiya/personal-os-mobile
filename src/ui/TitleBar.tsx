import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { Txt } from "./Txt";

export function TitleBar({ title, icon, actions }: { title: string; icon?: string; actions?: React.ReactNode }) {
  const t = useTheme();
  return (
    <LinearGradient
      colors={[t.color.titleA, t.color.titleB]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        minHeight: 28,
        paddingHorizontal: 8,
        paddingVertical: 3,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderTopLeftRadius: t.metric.radius,
        borderTopRightRadius: t.metric.radius,
      }}
    >
      <Txt variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>
        {icon ? `${icon} ` : ""}
        {title}
      </Txt>
      {actions ? <View style={{ flexDirection: "row", gap: 4, marginLeft: 8 }}>{actions}</View> : null}
    </LinearGradient>
  );
}
