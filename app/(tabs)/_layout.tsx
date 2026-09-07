import { Tabs } from "expo-router/js-tabs";
import React from "react";
import { Taskbar } from "@/screens/Taskbar";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <Taskbar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Home", icon: "🖥️" } as object} />
      <Tabs.Screen name="tasks" options={{ title: "Tasks", icon: "📋" } as object} />
      <Tabs.Screen name="journal" options={{ title: "Journal", icon: "📓" } as object} />
      <Tabs.Screen name="habits" options={{ title: "Habits", icon: "✅" } as object} />
      <Tabs.Screen
        name="more"
        // popToTopOnBlur empties the nested stack when the tab loses focus, so the module you
        // were reading is not still mounted underneath the menu next time.
        options={{ title: "More", icon: "🗂️", popToTopOnBlur: true } as object}
      />
    </Tabs>
  );
}
