import React from "react";
import { View } from "react-native";
import { Txt } from "./Txt";

/** Label above control. The web app puts labels to the left; phones need the width. */
export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 4 }}>
      <Txt variant="small">{label}</Txt>
      {children}
    </View>
  );
}
