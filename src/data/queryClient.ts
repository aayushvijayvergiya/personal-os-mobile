import { QueryCache, QueryClient, focusManager } from "@tanstack/react-query";
import { AppState, Platform } from "react-native";
import { showToast } from "@/ui/Toast";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => showToast(error instanceof Error ? error.message : String(error)),
  }),
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
  },
});

// Let TanStack Query treat "app returned to foreground" as a window focus.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => focusManager.setFocused(state === "active"));
}
