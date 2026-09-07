import React, { useState } from "react";
import { Image, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { horizonLabel } from "@/lib/horizons";
import type { Goal, VisionItem } from "@/lib/types";
import { useTheme } from "@/theme/useTheme";
import { Btn, Input, Txt, bevelStyle } from "@/ui";

export const CARD_WIDTH = 200;

/** Status maps to a coarse progress bar, exactly as on the web board. */
function goalPercent(goal: Goal | undefined): number {
  if (!goal) return 0;
  return goal.status === "done" ? 100 : goal.status === "in_progress" ? 50 : 0;
}

/**
 * A pinned card. Dragging starts after a short long-press so that ordinary taps still reach the
 * buttons and inputs inside the card, and so a vertical swipe scrolls the board instead.
 */
export function VisionCard({
  item,
  goal,
  onMoved,
  onRemove,
  onUpdateContent,
}: {
  item: VisionItem;
  goal?: Goal;
  onMoved: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  onUpdateContent: (id: string, content: VisionItem["content"]) => void;
}) {
  const t = useTheme();
  const [newListItem, setNewListItem] = useState("");
  const x = useSharedValue(item.pos_x);
  const y = useSharedValue(item.pos_y);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const pan = Gesture.Pan()
    .activateAfterLongPress(150)
    .onStart(() => {
      startX.value = x.value;
      startY.value = y.value;
    })
    .onUpdate((event) => {
      x.value = Math.max(0, startX.value + event.translationX);
      y.value = Math.max(0, startY.value + event.translationY);
    })
    .onEnd(() => {
      runOnJS(onMoved)(item.id, x.value, y.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { rotate: `${item.rotation}deg` }],
  }));

  const background =
    item.item_type === "note" ? (item.content.color ?? t.color.paperTint) : t.color.face;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          bevelStyle(t, "out"),
          {
            position: "absolute",
            left: 0,
            top: 0,
            width: CARD_WIDTH,
            padding: 8,
            gap: 4,
            zIndex: item.z_index,
            backgroundColor: background,
          },
          animatedStyle,
        ]}
      >
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Btn small accessibilityLabel="Remove card" onPress={() => onRemove(item.id)}>
            ✕
          </Btn>
        </View>

        {item.item_type === "note" ? <Txt>{item.content.text}</Txt> : null}

        {item.item_type === "image" ? (
          <>
            <View style={bevelStyle(t, "in")}>
              <Image
                source={{ uri: item.content.url }}
                accessibilityLabel={item.content.caption ?? "Vision image"}
                resizeMode="cover"
                style={{ width: "100%", height: 120 }}
              />
            </View>
            {item.content.caption ? (
              <Txt variant="small" style={{ textAlign: "center" }}>
                {item.content.caption}
              </Txt>
            ) : null}
          </>
        ) : null}

        {item.item_type === "goal" ? (
          goal ? (
            <>
              <Txt variant="bold">🎯 {goal.title}</Txt>
              <Txt variant="muted" style={{ fontSize: t.metric.fontSmall }}>
                {horizonLabel(goal.horizon_type, goal.horizon_value)}
              </Txt>
              <View style={[bevelStyle(t, "in"), { height: 14 }]}>
                <View
                  style={{
                    height: "100%",
                    width: `${goalPercent(goal)}%`,
                    backgroundColor: t.color.progress,
                  }}
                />
              </View>
              <Txt variant="small" style={{ textAlign: "center" }}>
                {goal.status.replace("_", " ")}
              </Txt>
            </>
          ) : (
            <Txt variant="danger" style={{ fontSize: t.metric.fontSmall }}>
              Goal deleted — remove this card.
            </Txt>
          )
        ) : null}

        {item.item_type === "list" ? (
          <>
            <Txt variant="bold">‼️ {item.content.title}</Txt>
            {(item.content.items ?? []).map((entry, index) => (
              <View key={`${entry}:${index}`} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Txt>•</Txt>
                <Txt style={{ flex: 1 }}>{entry}</Txt>
                <Btn
                  small
                  accessibilityLabel={`Remove ${entry}`}
                  onPress={() =>
                    onUpdateContent(item.id, {
                      ...item.content,
                      items: (item.content.items ?? []).filter((_, i) => i !== index),
                    })
                  }
                >
                  ✕
                </Btn>
              </View>
            ))}
            <Input
              placeholder="Add item…"
              value={newListItem}
              onChangeText={setNewListItem}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (!newListItem.trim()) return;
                onUpdateContent(item.id, {
                  ...item.content,
                  items: [...(item.content.items ?? []), newListItem.trim()],
                });
                setNewListItem("");
              }}
            />
          </>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

/** Diagonal corkboard hatching. Static, so a modest number of bars is cheap. */
export function CorkBackground({ size, stripe }: { size: number; stripe: string }) {
  const spacing = 64;
  const count = Math.ceil((size * 2) / spacing);
  return (
    <View pointerEvents="none" style={{ position: "absolute", width: size, height: size, overflow: "hidden" }}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: -size / 2 + i * spacing,
            top: -size / 2,
            width: 18,
            height: size * 2,
            backgroundColor: stripe,
            transform: [{ rotate: "45deg" }],
          }}
        />
      ))}
    </View>
  );
}
