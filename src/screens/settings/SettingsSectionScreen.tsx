import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { EmptyState, Screen, Txt, Window } from "@/ui";
import { SETTINGS_SECTIONS } from "./registry";

export function SettingsSectionScreen() {
  const t = useTheme();
  const router = useRouter();
  const { section: sectionId } = useLocalSearchParams<{ section: string }>();
  const section = SETTINGS_SECTIONS.find((s) => s.id === sectionId);

  if (!section) {
    return (
      <Screen onBack={() => router.back()}>
        <Window title="Control Panel" icon="⚙️">
          <EmptyState icon="⚙️" text="That settings page does not exist." />
        </Window>
      </Screen>
    );
  }

  const { Panel } = section;
  return (
    <Screen onBack={() => router.back()}>
      <Window title={`Control Panel ▸ ${section.title}`} icon={section.icon}>
        <Txt variant="muted" style={{ fontSize: t.metric.fontSmall, marginBottom: 10 }}>
          {section.description}
        </Txt>
        {/* Panels are plain fragments; this supplies the vertical rhythm between their fields. */}
        <View style={{ gap: 10 }}>
          <Panel />
        </View>
      </Window>
    </Screen>
  );
}
