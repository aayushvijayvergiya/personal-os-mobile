import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";
import { mutationsStub, queryStub } from "../helpers/fixtures";
import { renderWithProviders } from "../helpers/render";
import { useAllJournalQuestions, useJournalQuestionMutations } from "@/data/journal";
import type { JournalQuestion } from "@/lib/types";
import { JournalQuestionsPanel } from "@/screens/settings/panels/JournalQuestionsPanel";

jest.mock("@/data/journal");

const dailyQuestion: JournalQuestion = {
  id: "q1",
  prompt: "What went well today?",
  journal_type: "daily",
  sort_order: 0,
  active: true,
  created_on: "2026-01-01",
  retired_on: null,
};

describe("JournalQuestionsPanel", () => {
  const create = mutationsStub();
  const setActive = mutationsStub();
  const remove = mutationsStub();
  const edit = mutationsStub();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAllJournalQuestions as jest.Mock).mockReturnValue(queryStub([dailyQuestion]));
    (useJournalQuestionMutations as jest.Mock).mockReturnValue({ create, setActive, remove, edit });
  });

  it("shows each question's prompt in an editable field", async () => {
    const { getByDisplayValue } = await renderWithProviders(<JournalQuestionsPanel />);
    expect(getByDisplayValue("What went well today?")).toBeTruthy();
  });

  it("commits an edited prompt on blur", async () => {
    const { getByDisplayValue } = await renderWithProviders(<JournalQuestionsPanel />);
    const field = getByDisplayValue("What went well today?");
    await fireEvent.changeText(field, "What went great today?");
    await fireEvent(field, "blur");
    expect(edit.mutate).toHaveBeenCalledWith({ question: dailyQuestion, prompt: "What went great today?" });
  });

  it("does not commit on blur when the text is unchanged", async () => {
    const { getByDisplayValue } = await renderWithProviders(<JournalQuestionsPanel />);
    const field = getByDisplayValue("What went well today?");
    await fireEvent(field, "blur");
    expect(edit.mutate).not.toHaveBeenCalled();
  });

  it("removes a question after confirming", async () => {
    jest.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
      buttons?.find((b) => b.text === "Remove")?.onPress?.();
    });
    const { getByText } = await renderWithProviders(<JournalQuestionsPanel />);
    await fireEvent.press(getByText("Remove"));
    expect(remove.mutate).toHaveBeenCalledWith("q1");
  });
});
