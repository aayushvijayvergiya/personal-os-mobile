import { act, fireEvent, renderRouter } from "expo-router/testing-library";
import { router, Stack } from "expo-router";
import React from "react";
import { Text } from "react-native";

function leaf(label: string) {
  function LeafScreen() {
    return <Text>{label}</Text>;
  }
  return LeafScreen;
}

function RootLayoutStub() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

/**
 * Renders the real `(tabs)` and `(tabs)/more` layouts with stub leaf screens, so these tests
 * exercise the actual taskbar and nested-stack wiring without touching Supabase.
 */
async function build() {
  return renderRouter(
    {
      appDir: "./app",
      overrides: {
        _layout: RootLayoutStub,
        login: leaf("LOGIN"),
        "(tabs)/index": leaf("HOME"),
        "(tabs)/tasks": leaf("TASKS"),
        "(tabs)/journal": leaf("JOURNAL"),
        "(tabs)/habits": leaf("HABITS"),
        "(tabs)/more/index": leaf("MORE-MENU"),
        "(tabs)/more/notes": leaf("NOTES"),
        "(tabs)/more/goals": leaf("GOALS"),
        "(tabs)/more/calendar": leaf("CALENDAR"),
        "(tabs)/more/reading": leaf("READING"),
        "(tabs)/more/vision": leaf("VISION"),
        "(tabs)/more/kitchen-sink": leaf("KITCHEN"),
        "(tabs)/more/projects/index": leaf("PROJECTS"),
        "(tabs)/more/projects/[id]": leaf("PROJECT-DETAIL"),
        "(tabs)/more/settings/index": leaf("SETTINGS"),
        "(tabs)/more/settings/[section]": leaf("SETTINGS-SECTION"),
      },
    },
    { initialUrl: "/" },
  );
}

type Rendered = Awaited<ReturnType<typeof build>>;
const tap = (r: Rendered, tab: string) => fireEvent.press(r.getByLabelText(tab));

/** What `openFromTab` does, split across ticks the way the helper defers its push. */
async function openMoreModule(href: string) {
  await act(async () => router.navigate("/more"));
  await act(async () => router.push(href as Parameters<typeof router.push>[0]));
}

describe("the More tab always opens its menu", () => {
  it("after a dashboard link deep-links into a module", async () => {
    const r = await build();
    expect(r.queryByText("HOME")).toBeTruthy();

    await openMoreModule("/more/notes");
    expect(r.queryByText("NOTES")).toBeTruthy();

    await tap(r, "Home");
    await tap(r, "More");
    expect(r.queryByText("MORE-MENU")).toBeTruthy();
    expect(r.queryByText("NOTES")).toBeNull();
  });

  it("after opening a module from the menu and switching tabs", async () => {
    const r = await build();
    await tap(r, "More");
    await act(async () => router.push("/more/goals"));
    expect(r.queryByText("GOALS")).toBeTruthy();

    await tap(r, "Home");
    await tap(r, "More");
    expect(r.queryByText("MORE-MENU")).toBeTruthy();
  });

  it("when re-tapping More while already inside a module", async () => {
    const r = await build();
    await tap(r, "More");
    await act(async () => router.push("/more/goals"));
    await tap(r, "More");
    expect(r.queryByText("MORE-MENU")).toBeTruthy();
  });

  it("regression: pushing a module straight from another tab strands it at the stack root", async () => {
    // This is the bug `openFromTab` exists to avoid — kept so the helper is not "simplified"
    // back into a single push.
    const r = await build();
    await act(async () => router.push("/more/notes"));
    await tap(r, "Home");
    await tap(r, "More");
    expect(r.queryByText("NOTES")).toBeTruthy();
    expect(r.queryByText("MORE-MENU")).toBeNull();
  });
});
