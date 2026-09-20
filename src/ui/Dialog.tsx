import React from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { Bevel } from "./Bevel";
import { Btn } from "./Btn";
import { KeyboardScrollView } from "./KeyboardScroll";
import { TitleBar } from "./TitleBar";

/** A retro "Properties" window: dimmed backdrop, title bar with ✕, scrollable body, sticky footer. */
export function Dialog({
  title,
  icon,
  open,
  onClose,
  children,
  footer,
}: {
  title: string;
  icon?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const t = useTheme();
  if (!open) return null;
  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      {/* Shrinks the whole dialog (not just the scroll body) on iOS so the footer buttons stay above
          the keyboard — a separate job from `KeyboardScrollView`, which only scrolls the focused field. */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <Pressable
          accessibilityLabel="Close dialog"
          onPress={onClose}
          style={{ flex: 1, backgroundColor: t.color.overlay, justifyContent: "center", padding: 16 }}
        >
          {/* Swallow presses inside the window so only the backdrop closes it. */}
          <Pressable onPress={() => {}} style={{ maxHeight: "88%" }}>
            <Bevel variant="frame">
              <TitleBar
                title={title}
                icon={icon}
                actions={
                  <Btn small accessibilityLabel="Close" onPress={onClose}>
                    ✕
                  </Btn>
                }
              />
              <KeyboardScrollView
                contentContainerStyle={{ padding: 10, gap: 8 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              >
                {children}
              </KeyboardScrollView>
              {footer ? (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 8,
                    padding: 10,
                    paddingTop: 0,
                  }}
                >
                  {footer}
                </View>
              ) : null}
            </Bevel>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
