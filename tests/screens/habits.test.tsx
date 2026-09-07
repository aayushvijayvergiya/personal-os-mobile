import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { makeHabit, makeHabitEntry, mutationsStub, queryStub } from "../helpers/fixtures";
import { renderWithProviders } from "../helpers/render";
import { useHabitEntries, useHabitMutations, useHabits } from "@/data/habits";
import { useStats } from "@/data/stats";
import { fmt, todayISO } from "@/lib/dates";
import { HabitsScreen } from "@/screens/habits/HabitsScreen";

jest.mock("@/data/habits");
jest.mock("@/data/stats");

describe("HabitsScreen", () => {
  const toggle = mutationsStub();
  const today = todayISO();

  beforeEach(() => {
    jest.clearAllMocks();
    (useStats as jest.Mock).mockReturnValue("0 tasks due · 1/1 habits done");
    (useHabits as jest.Mock).mockReturnValue(
      queryStub([
        makeHabit({ id: "h1", name: "Read", icon: "📚" }),
        makeHabit({ id: "h2", name: "Retired one", active: false, sort_order: 1 }),
      ]),
    );
    (useHabitEntries as jest.Mock).mockReturnValue(
      queryStub([makeHabitEntry({ habit_id: "h1", date: today, checked: true })]),
    );
    (useHabitMutations as jest.Mock).mockReturnValue({
      toggle,
      create: mutationsStub(),
      rename: mutationsStub(),
      setActive: mutationsStub(),
      swapOrder: mutationsStub(),
    });
  });

  it("shows active habits with their streak stats and hides retired ones", async () => {
    const { getByText, queryByText } = await renderWithProviders(<HabitsScreen />);
    expect(getByText("📚 Read")).toBeTruthy();
    expect(getByText("🔥 1 streak")).toBeTruthy();
    expect(getByText("🏅 1 best")).toBeTruthy();
    expect(getByText("📊 3% of 30d")).toBeTruthy();
    expect(queryByText("⭐ Retired one")).toBeNull();
  });

  it("unchecks a day that is already checked", async () => {
    const { getByLabelText } = await renderWithProviders(<HabitsScreen />);
    await fireEvent.press(getByLabelText(`Read on ${fmt(today)}`));
    expect(toggle.mutate).toHaveBeenCalledWith({ habitId: "h1", date: today, checked: false });
  });

  it("lists retired habits in the manage dialog", async () => {
    const { getByText, getByLabelText } = await renderWithProviders(<HabitsScreen />);
    await fireEvent.press(getByText("Manage habits…"));
    expect(getByLabelText("Rename Retired one")).toBeTruthy();
    expect(getByText("Restore")).toBeTruthy();
  });
});
