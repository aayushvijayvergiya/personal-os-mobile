import { nextTaskRow } from "@/lib/taskRecurrence";
import type { Task } from "@/lib/types";
import { supabase } from "./supabase";

/** Insert the next occurrence of a just-completed repeating task. */
export async function spawnNext(t: Task, todayIso: string): Promise<void> {
  const row = nextTaskRow(t, todayIso);
  if (!row) return;
  const { error } = await supabase.from("tasks").insert(row);
  if (error) throw new Error(`Task completed, but creating the next occurrence failed: ${error.message}`);
}

/**
 * Mark a task done and spawn its next occurrence. The update only matches rows that are not
 * already done, so completing the same task twice (double tap, or from two screens) spawns once.
 */
export async function completeTask(t: Task, todayIso: string): Promise<void> {
  const { data, error } = await supabase.from("tasks")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", t.id).neq("status", "done").select("id");
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return; // already completed elsewhere
  await spawnNext(t, todayIso);
}
