import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { renderWithProviders } from "../helpers/render";
import { makeTask, mutationsStub, queryStub } from "../helpers/fixtures";
import { useTaskMutations, useTasks } from "@/data/tasks";
import { useFieldDefinitions } from "@/data/fieldDefinitions";
import { useStats } from "@/data/stats";
import { TasksScreen } from "@/screens/tasks/TasksScreen";

jest.mock("@/data/tasks");
jest.mock("@/data/fieldDefinitions");
jest.mock("@/data/stats");

const mockUseTasks = useTasks as jest.Mock;
const mockUseTaskMutations = useTaskMutations as jest.Mock;

describe("TasksScreen", () => {
  const create = mutationsStub();
  const toggleDone = mutationsStub();

  beforeEach(() => {
    jest.clearAllMocks();
    (useStats as jest.Mock).mockReturnValue("2 tasks due · 1/3 habits done");
    (useFieldDefinitions as jest.Mock).mockReturnValue(queryStub([]));
    mockUseTaskMutations.mockReturnValue({
      create,
      toggleDone,
      update: mutationsStub(),
      remove: mutationsStub(),
    });
    mockUseTasks.mockReturnValue(
      queryStub([
        makeTask({ id: "t1", title: "Write the weekly review", priority: 1, due_date: "2026-07-19" }),
        makeTask({ id: "t2", title: "Water the plants", status: "done", priority: 3 }),
      ]),
    );
  });

  it("lists tasks with their priority", async () => {
    const { getByText } = await renderWithProviders(<TasksScreen />);
    expect(getByText("Write the weekly review")).toBeTruthy();
    expect(getByText("Water the plants")).toBeTruthy();
    expect(getByText("P1")).toBeTruthy();
    expect(getByText("P3")).toBeTruthy();
  });

  it("starts on the Today tab and switches tabs", async () => {
    const { getByText } = await renderWithProviders(<TasksScreen />);
    expect(mockUseTasks).toHaveBeenLastCalledWith("today", false);
    await fireEvent.press(getByText("This Week"));
    expect(mockUseTasks).toHaveBeenLastCalledWith("week", false);
  });

  it("adds a task with the typed title and default priority", async () => {
    const { getByPlaceholderText, getByText } = await renderWithProviders(<TasksScreen />);
    await fireEvent.changeText(getByPlaceholderText("New task title…"), "Buy milk");
    await fireEvent.press(getByText("Add"));
    expect(create.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Buy milk", priority: 2 }),
    );
  });

  it("ignores an empty title", async () => {
    const { getByText } = await renderWithProviders(<TasksScreen />);
    await fireEvent.press(getByText("Add"));
    expect(create.mutate).not.toHaveBeenCalled();
  });

  it("toggles a task done", async () => {
    const { getAllByRole } = await renderWithProviders(<TasksScreen />);
    // The first checkbox is "Show completed"; task checkboxes follow.
    const boxes = getAllByRole("checkbox");
    await fireEvent.press(boxes[1]);
    expect(toggleDone.mutate).toHaveBeenCalledWith(expect.objectContaining({ id: "t1" }));
  });

  it("shows the empty state when there are no tasks", async () => {
    mockUseTasks.mockReturnValue(queryStub([]));
    const { getByText } = await renderWithProviders(<TasksScreen />);
    expect(getByText("No tasks here. Add one above. ▲")).toBeTruthy();
  });
});
