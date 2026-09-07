import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useSession } from "@/data/auth";
import { queryClient } from "@/data/queryClient";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { useAppFonts } from "@/theme/fonts";
import { useTheme } from "@/theme/useTheme";
import { ToastHost } from "@/ui";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthGate />
            <ToastHost />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Holds the splash until fonts and session are known, then shows either login or the tabs. */
function AuthGate() {
  const { session, loading } = useSession();
  const fontsReady = useAppFonts();
  const t = useTheme();
  const ready = !loading && fontsReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={t.dark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.color.desk } }}>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="login" />
        </Stack.Protected>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
