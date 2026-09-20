import { act, fireEvent } from "@testing-library/react-native";
import React from "react";
import { mutationsStub, queryStub } from "../helpers/fixtures";
import { renderWithProviders } from "../helpers/render";
import { useHabitEntries, useHabitMutations, useHabits } from "@/data/habits";
import { useJournalEntry, useJournalMutations, useJournalQuestions } from "@/data/journal";
import { useStats } from "@/data/stats";
import { useTaskMutations, useTasksDueOn } from "@/data/tasks";
import type { JournalEntry, JournalQuestion } from "@/lib/types";
import { JournalScreen } from "@/screens/journal/JournalScreen";

jest.mock("@/data/journal");
jest.mock("@/data/habits");
jest.mock("@/data/tasks");
jest.mock("@/data/stats");

const question: JournalQuestion = {
  id: "q1",
  prompt: "What went well today?",
  journal_type: "daily",
  sort_order: 0,
  active: true,
  created_on: "2026-01-01",
  retired_on: null,
};

const entry: JournalEntry = {
  id: "e1",
  date: "2026-07-19",
  type: "daily",
  answers: {},
  notes: "",
  day_rating: null,
};

describe("JournalScreen", () => {
  const save = mutationsStub();

  beforeEach(() => {
    jest.clearAllMocks();
    (useStats as jest.Mock).mockReturnValue("0 tasks due · 0/0 habits done");
    (useJournalQuestions as jest.Mock).mockReturnValue(queryStub([question]));
    (useJournalEntry as jest.Mock).mockReturnValue(queryStub(entry));
    (useJournalMutations as jest.Mock).mockReturnValue({ save });
    (useHabits as jest.Mock).mockReturnValue(queryStub([]));
    (useHabitEntries as jest.Mock).mockReturnValue(queryStub([]));
    (useHabitMutations as jest.Mock).mockReturnValue({
      toggle: mutationsStub(),
      create: mutationsStub(),
      rename: mutationsStub(),
      setActive: mutationsStub(),
      swapOrder: mutationsStub(),
    });
    (useTasksDueOn as jest.Mock).mockReturnValue(queryStub([]));
    (useTaskMutations as jest.Mock).mockReturnValue({
      toggleDone: mutationsStub(),
      create: mutationsStub(),
      update: mutationsStub(),
      remove: mutationsStub(),
    });
  });

  it("renders the active prompts and the answered counter", async () => {
    const { getByText } = await renderWithProviders(<JournalScreen />);
    expect(getByText("What went well today?")).toBeTruthy();
    expect(getByText("0 / 1 answered")).toBeTruthy();
  });

  it("saves a rating immediately", async () => {
    const { getByLabelText } = await renderWithProviders(<JournalScreen />);
    await fireEvent.press(getByLabelText("Rate 4 stars"));
    expect(save.mutate).toHaveBeenCalledWith(expect.objectContaining({ day_rating: 4 }));
  });

  it("debounces answer typing into a single save", async () => {
    jest.useFakeTimers();
    try {
      const { getByLabelText } = await renderWithProviders(<JournalScreen />);
      const field = getByLabelText("What went well today?");
      await fireEvent.changeText(field, "A good day");
      await fireEvent.changeText(field, "A very good day");
      expect(save.mutate).not.toHaveBeenCalled();
      await act(async () => {
        jest.advanceTimersByTime(700);
      });
      expect(save.mutate).toHaveBeenCalledTimes(1);
      expect(save.mutate).toHaveBeenCalledWith(
        expect.objectContaining({ answers: { q1: "A very good day" } }),
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it("switches to the weekly tab", async () => {
    const { getByText } = await renderWithProviders(<JournalScreen />);
    await fireEvent.press(getByText("Weekly"));
    expect(useJournalQuestions).toHaveBeenLastCalledWith("weekly");
  });
});
