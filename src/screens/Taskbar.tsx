import type { BottomTabBarProps } from "expo-router/js-tabs";
import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/useTheme";
import { Txt, bevelStyle } from "@/ui";

/** Extra fields the tab layout puts on each screen's options for this bar to read. */
interface TaskbarOptions {
  icon?: string;
}

/** A tab route holding a nested navigator carries that navigator's state here. */
interface NestedState {
  key?: string;
  index?: number;
}

/** Bottom tab bar drawn as a Windows taskbar: raised buttons, the active one pressed in. */
export function Taskbar({ state, descriptors, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        bevelStyle(t, "out"),
        { flexDirection: "row", gap: 4, padding: 4, paddingBottom: Math.max(insets.bottom, 4), borderRadius: 0 },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const active = state.index === index;
        const label = typeof options.title === "string" ? options.title : route.name;
        const { icon = "" } = options as TaskbarOptions;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
            onPress={() => {
              const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (event.defaultPrevented) return;

              // Re-tapping the tab you are already on returns it to its root screen.
              // Leaving and coming back is handled by `popToTopOnBlur` in the tabs layout.
              const nested = route.state as NestedState | undefined;
              if (nested?.key && (nested.index ?? 0) > 0) {
                navigation.dispatch({ type: "POP_TO_TOP", target: nested.key });
              }

              if (!active) navigation.navigate(route.name);
            }}
            style={[
              bevelStyle(t, active ? "in" : "out"),
              {
                flex: 1,
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: active ? t.color.desk : t.color.face,
              },
            ]}
          >
            <Txt style={{ fontSize: 18, lineHeight: 22 }}>{icon}</Txt>
            <Txt variant={active ? "bold" : "small"} style={{ fontSize: 10, lineHeight: 12 }}>
              {label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
