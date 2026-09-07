import React from "react";
import { Pressable, View } from "react-native";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { useTheme, useThemeControls } from "@/theme/useTheme";
import { Btn, Check, Progress, Txt, Window } from "@/ui";

/** A miniature of the app chrome, rendered inside the theme it is advertising. */
function ThemePreview() {
  const t = useTheme();
  return (
    <View style={{ backgroundColor: t.color.desk, padding: 6 }}>
      <Window title="Today" icon="📋">
        <Check checked onChange={() => {}} label="Write the review" />
        <Progress value={2} max={3} />
        <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
          <Btn small onPress={() => {}}>
            Cancel
          </Btn>
          <Btn small primary onPress={() => {}}>
            OK
          </Btn>
        </View>
      </Window>
    </View>
  );
}

function SectionHeading({ children }: { children: string }) {
  const t = useTheme();
  return (
    <Txt
      variant="bold"
      style={{
        fontSize: t.metric.fontSmall,
        borderBottomWidth: 1,
        borderBottomColor: t.color.dark,
        paddingBottom: 2,
        marginTop: 12,
        marginBottom: 4,
      }}
    >
      {children}
    </Txt>
  );
}

export function DisplayPanel() {
  const t = useTheme();
  const { themes, setThemeId, current, fonts, fontId, setFontId } = useThemeControls();

  return (
    <>
      <SectionHeading>TEXT</SectionHeading>
      <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
        Pick whichever reads more clearly on your screen.
      </Txt>
      {fonts.map((font) => {
        const on = font.id === fontId;
        return (
          <Pressable
            key={font.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${font.name} typeface`}
            onPress={() => setFontId(font.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingVertical: 8,
              paddingHorizontal: 6,
              marginTop: 4,
              borderWidth: 2,
              borderColor: on ? t.color.highlight : t.color.dark,
              backgroundColor: on ? t.color.paperTint : t.color.face,
            }}
          >
            <Txt variant="bold">{on ? "●" : "○"}</Txt>
            <View style={{ flex: 1 }}>
              <Txt variant="bold" style={{ fontFamily: font.family }}>
                {font.name}
              </Txt>
              <Txt variant="muted" style={{ fontSize: t.metric.fontSmall, fontFamily: font.family }}>
                {font.description}
              </Txt>
            </View>
          </Pressable>
        );
      })}

      <SectionHeading>COLOUR SCHEME</SectionHeading>
      <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
        Remembered on this device.
      </Txt>
      {themes.map((theme) => {
        const on = theme.id === current;
        return (
          <Pressable
            key={theme.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${theme.name} theme`}
            onPress={() => setThemeId(theme.id)}
            style={{
              borderWidth: 2,
              borderColor: on ? t.color.highlight : t.color.dark,
              marginTop: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                padding: 6,
                backgroundColor: t.color.face,
              }}
            >
              <Txt variant="bold">{on ? "●" : "○"}</Txt>
              <Txt variant="bold" style={{ flex: 1 }}>
                {theme.name}
              </Txt>
              <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
                {theme.dark ? "Dark" : "Light"}
              </Txt>
            </View>
            {/* Nested provider so the preview paints in its own theme, not the active one. */}
            <ThemeProvider initialId={theme.id} initialFontId={fontId}>
              <ThemePreview />
            </ThemeProvider>
          </Pressable>
        );
      })}
    </>
  );
}
