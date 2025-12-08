"use client";

import { useEffect, useState } from "react";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { logEvent } from "@/lib/logEvent";
import { CheckCircle2, RotateCcw, Trash2 } from "lucide-react";

type TaskRow = {
  id: string;
  title: string;
  is_done: boolean;
  created_at: string;
  user_id: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
};

type AdminTask = TaskRow & {
  user_email: string | null;
  user_name: string | null;
};

export default function AdminTasksPage() {
  const supabase = createClientComponentClient();
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadTasks() {
    setLoading(true);

    // 1. Récupérer toutes les tâches
    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (tasksError) {
      console.error("Erreur load tasks admin:", tasksError);
      void logEvent("error", "Erreur chargement des tâches (admin)", {
        error: tasksError,
      });
      setLoading(false);
      return;
    }

    const tasksRows = (tasksData ?? []) as TaskRow[];

    // 2. Récupérer les profils liés aux user_id
    const userIds = Array.from(new Set(tasksRows.map((t) => t.user_id)));

    const profilesMap = new Map<string, ProfileRow>();

    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      (profilesData ?? []).forEach((p: ProfileRow) => profilesMap.set(p.id, p));
    }

    // 3. Fusion tasks + profiles
    const merged = tasksRows.map((t) => {
      const p = profilesMap.get(t.user_id);
      return {
        ...t,
        user_email: p?.email ?? null,
        user_name: p?.full_name ?? null,
      };
    });

    setTasks(merged);
    setLoading(false);
  }

  async function toggleTask(id: string, currentState: boolean) {
    const { error } = await supabase
      .from("tasks")
      .update({ is_done: !currentState })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    await logEvent("info", "Admin toggle tâche", {
      id,
      is_done: !currentState,
    });

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_done: !currentState } : t))
    );
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }

    await logEvent("warning", "Tâche supprimée par admin", { id });

    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">
        Gestion des tâches (ADMIN)
      </h1>

      <div className="space-y-3">
        {tasks.map((task) => {
          const userDisplay =
            task.user_name ??
            task.user_email ??
            `[${task.user_id.slice(0, 6)}…]`;

          const statusLabel = task.is_done ? "Terminée" : "En cours";
          const statusClasses = task.is_done
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700";

          return (
            <div
              key={task.id}
              className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-900">{task.title}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium mr-2 ${statusClasses}`}
                  >
                    {statusLabel}
                  </span>
                  {new Date(task.created_at).toLocaleString("fr-FR")} –{" "}
                  <span className="font-semibold">Utilisateur :</span>{" "}
                  {userDisplay}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {/* Basculer l'état */}
                <button
                  onClick={() => toggleTask(task.id, task.is_done)}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
                    task.is_done ? "hover:bg-amber-50" : "hover:bg-emerald-50"
                  }`}
                  aria-label={
                    task.is_done
                      ? "Repasser en en cours"
                      : "Marquer comme terminée"
                  }
                >
                  {task.is_done ? (
                    <RotateCcw className="h-4 w-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                </button>

                {/* Supprimer */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-rose-50"
                  aria-label="Supprimer la tâche"
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
