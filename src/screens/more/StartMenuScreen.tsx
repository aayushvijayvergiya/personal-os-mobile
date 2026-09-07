import { useRouter, type Href } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { signOut, useSession } from "@/data/auth";
import { useTheme } from "@/theme/useTheme";
import { Btn, Screen, Txt, Window, bevelStyle } from "@/ui";

const TILES: { href: Href; icon: string; label: string }[] = [
  { href: "/more/goals", icon: "🎯", label: "Goals" },
  { href: "/more/projects", icon: "📁", label: "Projects" },
  { href: "/more/calendar", icon: "📅", label: "Calendar" },
  { href: "/more/notes", icon: "🗒️", label: "Notes" },
  { href: "/more/reading", icon: "📚", label: "Reading" },
  { href: "/more/vision", icon: "🌄", label: "Vision Board" },
  { href: "/more/settings", icon: "⚙️", label: "Settings" },
  ...(__DEV__ ? [{ href: "/more/kitchen-sink" as Href, icon: "🧪", label: "Kitchen Sink" }] : []),
];

/** The "Start menu": a grid of the modules that don't have their own taskbar tab. */
export function StartMenuScreen() {
  const t = useTheme();
  const router = useRouter();
  const { session } = useSession();
  return (
    <Screen>
      <Window title="Personal OS" icon="🗂️">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {TILES.map((tile) => (
            <Pressable
              key={tile.label}
              accessibilityRole="button"
              accessibilityLabel={tile.label}
              onPress={() => router.push(tile.href)}
              style={({ pressed }) => [
                bevelStyle(t, pressed ? "in" : "out"),
                { width: "31%", flexGrow: 1, minHeight: 84, alignItems: "center", justifyContent: "center", gap: 4 },
              ]}
            >
              <Txt style={{ fontSize: 28, lineHeight: 34 }}>{tile.icon}</Txt>
              <Txt variant="small">{tile.label}</Txt>
            </Pressable>
          ))}
        </View>
      </Window>
      <Window title="Session" icon="🔐">
        {session?.user?.email ? (
          <Txt style={{ marginBottom: 8 }}>
            Signed in as <Txt variant="bold">{session.user.email}</Txt>
          </Txt>
        ) : null}
        <Btn onPress={() => signOut()}>Log Off Personal OS…</Btn>
      </Window>
    </Screen>
  );
}
