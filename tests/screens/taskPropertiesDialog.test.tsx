import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { makeTask, mutationsStub, queryStub } from "../helpers/fixtures";
import { renderWithProviders } from "../helpers/render";
import { useFieldDefinitions } from "@/data/fieldDefinitions";
import { useTaskMutations } from "@/data/tasks";
import { TaskPropertiesDialog } from "@/screens/shared/TaskPropertiesDialog";

jest.mock("@/data/tasks");
jest.mock("@/data/fieldDefinitions");

describe("TaskPropertiesDialog", () => {
  const update = mutationsStub();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTaskMutations as jest.Mock).mockReturnValue({ update, remove: mutationsStub() });
    (useFieldDefinitions as jest.Mock).mockReturnValue(queryStub([]));
  });

  it("saving a clamped monthly copy keeps its day-of-month", async () => {
    const draft = makeTask({ due_date: "2026-02-28", recurrence: { freq: "monthly", interval: 1, day: 31 } });
    const { getByText } = await renderWithProviders(
      <TaskPropertiesDialog allowRepeat draft={draft} onChange={jest.fn()} onClose={jest.fn()} />,
    );
    await fireEvent.press(getByText("OK"));
    expect(update.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ recurrence: { freq: "monthly", interval: 1, day: 31 } }),
    );
  });

  it("leaves recurrence untouched when repeat is not offered (Projects)", async () => {
    const draft = makeTask({ due_date: null, recurrence: null });
    const { getByText } = await renderWithProviders(
      <TaskPropertiesDialog draft={draft} onChange={jest.fn()} onClose={jest.fn()} />,
    );
    await fireEvent.press(getByText("OK"));
    expect(update.mutate).toHaveBeenCalledWith(expect.objectContaining({ recurrence: null }));
  });
});
