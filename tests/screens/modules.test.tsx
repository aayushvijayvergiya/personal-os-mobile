import { fireEvent } from "@testing-library/react-native";
import React from "react";
import {
  makeBook,
  makeGoal,
  makeHabit,
  makeNote,
  makeProject,
  makeTask,
  mutationsStub,
  queryStub,
} from "../helpers/fixtures";
import { renderWithProviders } from "../helpers/render";
import { useBookMutations, useBooks } from "@/data/books";
import { useTableCounts } from "@/data/counts";
import { useCategories, useCategoryMutations, useGoalMutations, useGoals } from "@/data/goals";
import { useHabitEntries, useHabitMutations, useHabits } from "@/data/habits";
import { useNoteMutations, useNotes, usePinnedNotes } from "@/data/notes";
import { useProjectMutations, useProjects } from "@/data/projects";
import { useStats } from "@/data/stats";
import {
  useProjectTasks,
  useTaskMutations,
  useTasksCompletedOn,
  useTasksDueUpTo,
  useTasksInRange,
} from "@/data/tasks";
import { useFieldDefinitions } from "@/data/fieldDefinitions";
import { todayISO } from "@/lib/dates";
import { CalendarScreen } from "@/screens/calendar/CalendarScreen";
import { DashboardScreen } from "@/screens/dashboard/DashboardScreen";
import { GoalsScreen } from "@/screens/goals/GoalsScreen";
import { NotesScreen } from "@/screens/notes/NotesScreen";
import { ProjectsScreen } from "@/screens/projects/ProjectsScreen";
import { ReadingScreen } from "@/screens/reading/ReadingScreen";
import { SettingsScreen } from "@/screens/settings/SettingsScreen";

jest.mock("@/data/tasks");
jest.mock("@/data/goals");
jest.mock("@/data/habits");
jest.mock("@/data/notes");
jest.mock("@/data/books");
jest.mock("@/data/projects");
jest.mock("@/data/stats");
jest.mock("@/data/counts");
jest.mock("@/data/fieldDefinitions");

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockNavigate = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: jest.fn() }),
  useLocalSearchParams: () => ({}),
  // Wrapped rather than referenced directly: the factory runs during module import,
  // before these consts are initialised.
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    navigate: (...args: unknown[]) => mockNavigate(...args),
  },
}));

const taskMutations = {
  create: mutationsStub(),
  update: mutationsStub(),
  remove: mutationsStub(),
  toggleDone: mutationsStub(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (useStats as jest.Mock).mockReturnValue("1 tasks due · 0/1 habits done");
  (useFieldDefinitions as jest.Mock).mockReturnValue(queryStub([]));
  (useTaskMutations as jest.Mock).mockReturnValue(taskMutations);
  (useTasksDueUpTo as jest.Mock).mockReturnValue(queryStub([makeTask({ title: "Ship the build" })]));
  (useTasksCompletedOn as jest.Mock).mockReturnValue(queryStub([]));
  (useTasksInRange as jest.Mock).mockReturnValue(queryStub([]));
  (useProjectTasks as jest.Mock).mockReturnValue(queryStub([]));
  (useGoals as jest.Mock).mockReturnValue(queryStub([]));
  (useCategories as jest.Mock).mockReturnValue(queryStub([]));
  (useGoalMutations as jest.Mock).mockReturnValue({
    save: mutationsStub(),
    cycleStatus: mutationsStub(),
    remove: mutationsStub(),
  });
  (useCategoryMutations as jest.Mock).mockReturnValue({
    create: mutationsStub(),
    remove: mutationsStub(),
  });
  (useHabits as jest.Mock).mockReturnValue(queryStub([makeHabit()]));
  (useHabitEntries as jest.Mock).mockReturnValue(queryStub([]));
  (useHabitMutations as jest.Mock).mockReturnValue({
    toggle: mutationsStub(),
    create: mutationsStub(),
    rename: mutationsStub(),
    setActive: mutationsStub(),
    swapOrder: mutationsStub(),
  });
  (useNotes as jest.Mock).mockReturnValue(queryStub([]));
  (usePinnedNotes as jest.Mock).mockReturnValue(queryStub([]));
  (useNoteMutations as jest.Mock).mockReturnValue({
    create: mutationsStub(),
    update: mutationsStub(),
    togglePin: mutationsStub(),
    remove: mutationsStub(),
  });
  (useBooks as jest.Mock).mockReturnValue(queryStub([]));
  (useBookMutations as jest.Mock).mockReturnValue({
    create: mutationsStub(),
    move: mutationsStub(),
    finish: mutationsStub(),
    update: mutationsStub(),
    remove: mutationsStub(),
  });
  (useProjects as jest.Mock).mockReturnValue(queryStub([]));
  (useProjectMutations as jest.Mock).mockReturnValue({ save: mutationsStub() });
  (useTableCounts as jest.Mock).mockReturnValue(queryStub({ categories: 3 }));
});

describe("DashboardScreen", () => {
  it("shows today's tasks, habits and the glance panel", async () => {
    const { getByText } = await renderWithProviders(<DashboardScreen />);
    expect(getByText("Ship the build")).toBeTruthy();
    expect(getByText("📚 Read")).toBeTruthy();
    expect(getByText(/At a Glance/)).toBeTruthy();
    expect(getByText("No pinned notes.")).toBeTruthy();
  });

  it("navigates to Tasks from the open link", async () => {
    const { getByText } = await renderWithProviders(<DashboardScreen />);
    await fireEvent.press(getByText("Open Tasks →"));
    expect(mockNavigate).toHaveBeenCalledWith("/tasks");
  });

  it("opens Notes from the floating button via the More tab, not as a direct push", async () => {
    const { getByLabelText } = await renderWithProviders(<DashboardScreen />);
    await fireEvent.press(getByLabelText("Open Notes"));
    // Step one only: the module push is deferred to a later tick on purpose.
    expect(mockNavigate).toHaveBeenCalledWith("/more");
    expect(mockPush).not.toHaveBeenCalledWith("/more/notes");
  });
});

describe("GoalsScreen", () => {
  it("groups goals by horizon and filters by period", async () => {
    (useGoals as jest.Mock).mockReturnValue(
      queryStub([
        makeGoal({ id: "g1", title: "Run a half marathon", horizon_type: "month", horizon_value: "2026-07" }),
        makeGoal({ id: "g2", title: "Learn Portuguese", horizon_type: "year", horizon_value: "2026" }),
      ]),
    );
    const { getByText } = await renderWithProviders(<GoalsScreen />);
    expect(getByText("Run a half marathon")).toBeTruthy();
    expect(getByText("Learn Portuguese")).toBeTruthy();

    await fireEvent.press(getByText("🏆 Year"));
    expect(getByText(/Yearly Goals/)).toBeTruthy();
  });

  it("cycles a goal's status", async () => {
    const cycleStatus = mutationsStub();
    (useGoalMutations as jest.Mock).mockReturnValue({
      save: mutationsStub(),
      cycleStatus,
      remove: mutationsStub(),
    });
    (useGoals as jest.Mock).mockReturnValue(queryStub([makeGoal({ id: "g1", title: "Read 12 books" })]));
    const { getByLabelText } = await renderWithProviders(<GoalsScreen />);
    await fireEvent.press(getByLabelText("Cycle status of Read 12 books"));
    expect(cycleStatus.mutate).toHaveBeenCalledWith(expect.objectContaining({ id: "g1" }));
  });
});

describe("NotesScreen", () => {
  it("filters notes by the search box", async () => {
    (useNotes as jest.Mock).mockReturnValue(
      queryStub([
        makeNote({ id: "n1", body: "Remember the milk" }),
        makeNote({ id: "n2", body: "Call the dentist" }),
      ]),
    );
    const { getByPlaceholderText, getByText, queryByText } = await renderWithProviders(<NotesScreen />);
    expect(getByText("Call the dentist")).toBeTruthy();
    await fireEvent.changeText(getByPlaceholderText("🔍 Search…"), "milk");
    expect(getByText("Remember the milk")).toBeTruthy();
    expect(queryByText("Call the dentist")).toBeNull();
  });

  it("captures a new note", async () => {
    const create = mutationsStub();
    (useNoteMutations as jest.Mock).mockReturnValue({
      create,
      update: mutationsStub(),
      togglePin: mutationsStub(),
      remove: mutationsStub(),
    });
    const { getByPlaceholderText, getByText } = await renderWithProviders(<NotesScreen />);
    await fireEvent.changeText(getByPlaceholderText("Jot something down…"), "New idea");
    await fireEvent.press(getByText("Add"));
    expect(create.mutate).toHaveBeenCalledWith("New idea");
  });
});

describe("ReadingScreen", () => {
  it("shows the current shelf and moves a book", async () => {
    const move = mutationsStub();
    (useBookMutations as jest.Mock).mockReturnValue({
      create: mutationsStub(),
      move,
      finish: mutationsStub(),
      update: mutationsStub(),
      remove: mutationsStub(),
    });
    (useBooks as jest.Mock).mockReturnValue(
      queryStub([makeBook({ id: "b1", title: "Deep Work", status: "to_read" })]),
    );
    const { getByText } = await renderWithProviders(<ReadingScreen />);
    expect(getByText("Deep Work")).toBeTruthy();
    await fireEvent.press(getByText("Reading"));
    expect(move.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "reading", item: expect.objectContaining({ id: "b1" }) }),
    );
  });

  it("switches to the Articles shelf", async () => {
    (useBooks as jest.Mock).mockReturnValue(
      queryStub([makeBook({ id: "a1", title: "A good post", item_type: "article", status: "to_read" })]),
    );
    const { getByText, getByPlaceholderText } = await renderWithProviders(<ReadingScreen />);
    await fireEvent.press(getByText("📰 Articles"));
    expect(getByPlaceholderText("Article title…")).toBeTruthy();
    expect(getByText("A good post")).toBeTruthy();
  });
});

describe("ProjectsScreen", () => {
  it("lists projects with their task counts", async () => {
    (useProjects as jest.Mock).mockReturnValue(
      queryStub([makeProject({ id: "p1", name: "Kitchen remodel" })]),
    );
    (useProjectTasks as jest.Mock).mockReturnValue(
      queryStub([
        makeTask({ id: "t1", project_id: "p1", status: "done" }),
        makeTask({ id: "t2", project_id: "p1" }),
      ]),
    );
    const { getByText } = await renderWithProviders(<ProjectsScreen />);
    expect(getByText("Kitchen remodel")).toBeTruthy();
    expect(getByText("1/2 tasks done")).toBeTruthy();
  });

  it("opens a project", async () => {
    (useProjects as jest.Mock).mockReturnValue(
      queryStub([makeProject({ id: "p1", name: "Kitchen remodel" })]),
    );
    const { getByLabelText } = await renderWithProviders(<ProjectsScreen />);
    await fireEvent.press(getByLabelText("Kitchen remodel"));
    expect(mockPush).toHaveBeenCalledWith("/more/projects/p1");
  });
});

describe("CalendarScreen", () => {
  it("shows the anchor month and reveals a day panel on tap", async () => {
    const today = todayISO();
    (useTasksInRange as jest.Mock).mockReturnValue(
      queryStub([makeTask({ id: "t1", title: "Dentist", due_date: today })]),
    );
    const { getByText, getByLabelText } = await renderWithProviders(<CalendarScreen />);
    expect(getByText("Month")).toBeTruthy();
    await fireEvent.press(getByLabelText(new RegExp(`^${today},`)));
    expect(getByText("• Dentist")).toBeTruthy();
  });
});

describe("SettingsScreen", () => {
  it("lists sections by group and filters them by search", async () => {
    const { getByText, getByPlaceholderText, queryByText } = await renderWithProviders(<SettingsScreen />);
    expect(getByText("Goal Categories")).toBeTruthy();
    expect(getByText("Display")).toBeTruthy();
    expect(getByText("PERSONALIZATION")).toBeTruthy();

    await fireEvent.changeText(getByPlaceholderText("🔍 Search settings…"), "dark");
    expect(getByText("Display")).toBeTruthy();
    expect(queryByText("Goal Categories")).toBeNull();
  });

  it("opens a section", async () => {
    const { getByLabelText } = await renderWithProviders(<SettingsScreen />);
    await fireEvent.press(getByLabelText("Display"));
    expect(mockPush).toHaveBeenCalledWith("/more/settings/display");
  });
});

describe("More-tab navigation", () => {
  it.each([
    ["Goals", GoalsScreen],
    ["Notes", NotesScreen],
    ["Reading", ReadingScreen],
    ["Calendar", CalendarScreen],
    ["Projects", ProjectsScreen],
    ["Control Panel", SettingsScreen],
  ])("%s offers a back button that returns to the More menu", async (_name, ScreenUnderTest) => {
    const { getByLabelText } = await renderWithProviders(<ScreenUnderTest />);
    await fireEvent.press(getByLabelText("Go back"));
    expect(mockBack).toHaveBeenCalled();
  });
});
