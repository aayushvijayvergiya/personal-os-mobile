import { router } from "expo-router";
import { openFromTab } from "@/lib/moreNavigation";

jest.mock("expo-router", () => ({
  router: { navigate: jest.fn(), push: jest.fn() },
}));

const mockRouter = router as unknown as { navigate: jest.Mock; push: jest.Mock };

describe("openFromTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it("navigates straight to a top-level tab", () => {
    openFromTab("/tasks");
    expect(mockRouter.navigate).toHaveBeenCalledWith("/tasks");
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("switches to the More tab first, then pushes the module on a later tick", () => {
    openFromTab("/more/notes");
    expect(mockRouter.navigate).toHaveBeenCalledWith("/more");
    // Deferred on purpose: pushing in the same tick makes the module the stack root.
    expect(mockRouter.push).not.toHaveBeenCalled();

    jest.runAllTimers();
    expect(mockRouter.push).toHaveBeenCalledWith("/more/notes");
  });

  it("orders the two steps, menu before module", () => {
    openFromTab("/more/goals");
    jest.runAllTimers();
    expect(mockRouter.navigate.mock.invocationCallOrder[0]).toBeLessThan(
      mockRouter.push.mock.invocationCallOrder[0],
    );
  });
});
