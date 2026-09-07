import { Stack } from "expo-router";
import React from "react";
import { useTheme } from "@/theme/useTheme";

/**
 * Anchoring the stack to `index` means a deep link straight to a module — the dashboard's
 * floating Notes button, for example — still builds the stack as [menu, module], so Back
 * returns to the More menu instead of dead-ending.
 */
export const unstable_settings = { anchor: "index" };

/** Nested stack under the "More" tab so the taskbar stays visible on every module. */
export default function MoreLayout() {
  const t = useTheme();
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.color.desk } }}
    />
  );
}
