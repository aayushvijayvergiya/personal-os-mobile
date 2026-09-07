import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { todayISO } from "@/lib/dates";
import { taskFilterFor, type TaskTab } from "@/lib/taskFilters";
import type { CustomFields, Task } from "@/lib/types";
import { rows, toastError } from "./helpers";
import { keys } from "./keys";
import { supabase } from "./supabase";

/** Standalone tasks only — project tasks live in the Projects module, as on the web. */
function standalone() {
  return supabase.from("tasks").select("*").is("project_id", null);
}

export function useTasks(tab: TaskTab, showDone: boolean) {
  return useQuery({
    queryKey: keys.tasks.list({ tab, showDone }),
    queryFn: async () => {
      const f = taskFilterFor(tab, showDone, todayISO());
      let q = standalone()
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("priority");
      if (f.onlyDone) q = q.eq("status", "done");
      if (f.excludeDone) q = q.neq("status", "done");
      if (f.dueLte) q = q.lte("due_date", f.dueLte);
      return rows<Task>(await q);
    },
  });
}

/** Open standalone tasks due on or before a date — the dashboard's "Today" list. */
export function useTasksDueUpTo(date: string) {
  return useQuery({
    queryKey: keys.tasks.dueUpTo(date),
    queryFn: async () =>
      rows<Task>(await standalone().neq("status", "done").lte("due_date", date).order("priority")),
  });
}

/** Tasks completed on a given calendar day, newest first. */
export function useTasksCompletedOn(date: string) {
  return useQuery({
    queryKey: keys.tasks.completedOn(date),
    queryFn: async () =>
      rows<Task>(
        await standalone()
          .eq("status", "done")
          .gte("completed_at", `${date}T00:00:00`)
          .lte("completed_at", `${date}T23:59:59.999`)
          .order("completed_at", { ascending: false }),
      ),
  });
}

/** Standalone tasks due exactly on a date — the journal's task list. */
export function useTasksDueOn(date: string) {
  return useQuery({
    queryKey: keys.tasks.dueOn(date),
    queryFn: async () => rows<Task>(await standalone().eq("due_date", date).order("priority")),
  });
}

/** Standalone tasks inside a date window — the calendar. */
export function useTasksInRange(from: string, to: string) {
  return useQuery({
    queryKey: keys.tasks.range(from, to),
    queryFn: async () => rows<Task>(await standalone().gte("due_date", from).lte("due_date", to)),
  });
}

/** Every task that belongs to a project. */
export function useProjectTasks() {
  return useQuery({
    queryKey: keys.tasks.project,
    queryFn: async () =>
      rows<Task>(
        await supabase
          .from("tasks")
          .select("*")
          .not("project_id", "is", null)
          .order("due_date", { ascending: true, nullsFirst: false }),
      ),
  });
}

export interface TaskDraft {
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: number;
  status?: Task["status"];
  project_id?: string | null;
  custom_fields?: CustomFields;
}

export function useTaskMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: keys.tasks.all });
    qc.invalidateQueries({ queryKey: keys.stats });
  };

  const create = useMutation({
    mutationFn: async (draft: TaskDraft) => {
      const { error } = await supabase.from("tasks").insert({
        title: draft.title.trim(),
        due_date: draft.due_date ?? null,
        priority: draft.priority ?? 2,
        project_id: draft.project_id ?? null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  const update = useMutation({
    mutationFn: async (task: Task) => {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: task.title,
          description: task.description,
          due_date: task.due_date || null,
          priority: task.priority,
          status: task.status,
          project_id: task.project_id,
          custom_fields: task.custom_fields,
          completed_at:
            task.status === "done" ? (task.completed_at ?? new Date().toISOString()) : null,
        })
        .eq("id", task.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  /** Optimistic, because ticking a checkbox must feel instant. */
  const toggleDone = useMutation({
    mutationFn: async (task: Task) => {
      const done = task.status !== "done";
      const { error } = await supabase
        .from("tasks")
        .update({
          status: done ? "done" : "open",
          completed_at: done ? new Date().toISOString() : null,
        })
        .eq("id", task.id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (task: Task) => {
      await qc.cancelQueries({ queryKey: keys.tasks.all });
      const snapshot = qc.getQueriesData<Task[]>({ queryKey: keys.tasks.all });
      const done = task.status !== "done";
      for (const [key, list] of snapshot) {
        if (!Array.isArray(list)) continue;
        qc.setQueryData(
          key,
          list.map((row) =>
            row.id === task.id
              ? {
                  ...row,
                  status: done ? ("done" as const) : ("open" as const),
                  completed_at: done ? new Date().toISOString() : null,
                }
              : row,
          ),
        );
      }
      return { snapshot };
    },
    onError: (error, _task, context) => {
      context?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
      toastError(error);
    },
    onSettled: invalidate,
  });

  return { create, update, remove, toggleDone };
}
