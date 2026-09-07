import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Window } from "./Window";
import { Txt } from "./Txt";

let push: ((msg: string) => void) | null = null;

/** Show a retro alert window for 4 s. Safe to call from anywhere (mutations, query cache). */
export function showToast(msg: string) {
  push?.(msg);
}

export function ToastHost() {
  const [msgs, setMsgs] = useState<{ id: number; msg: string }[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    push = (msg) => {
      const id = Date.now() + Math.random();
      setMsgs((m) => [...m, { id, msg }]);
      setTimeout(() => setMsgs((m) => m.filter((x) => x.id !== id)), 4000);
    };
    return () => {
      push = null;
    };
  }, []);

  if (msgs.length === 0) return null;
  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left: 12, right: 12, bottom: insets.bottom + 72, gap: 6, zIndex: 100 }}
    >
      {msgs.map((m) => (
        <Window key={m.id} title="Personal OS" icon="⚠️">
          <Txt variant="small">{m.msg}</Txt>
        </Window>
      ))}
    </View>
  );
}
