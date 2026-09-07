import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@/theme/ThemeProvider";
import type { ThemeId } from "@/theme/tokens";

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** Renders a component with the providers every screen assumes. RNTL v14 render is async. */
export function renderWithProviders(ui: React.ReactElement, themeId: ThemeId = "chicago") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider initialId={themeId}>{ui}</ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>,
  );
}
