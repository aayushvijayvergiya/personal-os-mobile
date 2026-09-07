import React from "react";
import { View } from "react-native";
import { Txt } from "./Txt";

export function EmptyState({ icon, text }: { icon?: string; text: string }) {
  return (
    <View style={{ alignItems: "center", gap: 4, paddingVertical: 16 }}>
      {icon ? <Txt style={{ fontSize: 24, lineHeight: 30 }}>{icon}</Txt> : null}
      <Txt variant="muted" style={{ textAlign: "center" }}>
        {text}
      </Txt>
    </View>
  );
}
