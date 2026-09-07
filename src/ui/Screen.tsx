import React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/theme/useTheme";
import { Btn } from "./Btn";
import { StatusStrip } from "./StatusStrip";

/**
 * Desk-coloured safe-area page with the persistent status strip on top.
 * `scroll` (default true) wraps the children in a ScrollView with pull-to-refresh.
 * `onBack` adds the Control-Panel-style back button used by every module under the More tab.
 * `fab` pins a floating button to the bottom-right, clear of the taskbar.
 */
export function Screen({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  statusStrip = true,
  onBack,
  fab,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  statusStrip?: boolean;
  onBack?: () => void;
  fab?: React.ReactNode;
}) {
  const t = useTheme();
  const pad = { padding: t.metric.gap, gap: t.metric.gap };
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: t.color.desk }}>
      {statusStrip ? (
        <View style={{ paddingHorizontal: t.metric.gap, paddingTop: t.metric.gap }}>
          <StatusStrip />
        </View>
      ) : null}
      {onBack ? (
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: t.metric.gap,
            paddingTop: t.metric.gap,
          }}
        >
          <Btn small accessibilityLabel="Go back" onPress={onBack}>
            ◀ Back
          </Btn>
        </View>
      ) : null}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[pad, fab ? { paddingBottom: 80 } : null]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={t.color.text} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, minHeight: 0 }, pad]}>{children}</View>
      )}
      {fab ? <View style={{ position: "absolute", right: 16, bottom: 16 }}>{fab}</View> : null}
    </SafeAreaView>
  );
}
