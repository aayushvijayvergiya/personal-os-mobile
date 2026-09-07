import React from "react";
import { Screen, Txt, Window } from "@/ui";

/** Stand-in for screens not yet built. Replaced phase by phase per docs/plan.md §11. */
export function PlaceholderScreen({ title, icon, phase }: { title: string; icon: string; phase: number }) {
  return (
    <Screen>
      <Window title={title} icon={icon}>
        <Txt variant="muted">Coming in Phase {phase}. See docs/plan.md.</Txt>
      </Window>
    </Screen>
  );
}
