"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { logEvent } from "@/lib/logEvent";

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
      await logEvent("error", "Erreur chargement des tâches (admin)", {
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

    // 3. Fusion tasks + profiles (RELIABLE)
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

    if (error) return console.error(error);

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
    if (error) return console.error(error);

    await logEvent("warning", "Tâche supprimée par admin", { id });

    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Gestion des tâches (ADMIN)</h1>

      <div className="space-y-3">
        {tasks.map((task) => {
          const userDisplay =
            task.user_name ??
            task.user_email ??
            `[${task.user_id.slice(0, 6)}…]`;

          return (
            <div
              key={task.id}
              className="flex items-center justify-between border p-2 rounded"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-neutral-500">
                  {task.is_done ? "✅ faite" : "⏳ en cours"} –{" "}
                  {new Date(task.created_at).toLocaleString("fr-FR")}
                  <br />
                  <span className="font-semibold">Utilisateur :</span>{" "}
                  {userDisplay}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleTask(task.id, task.is_done)}
                  className="text-xs underline"
                >
                  Basculer état
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-xs text-red-600 underline"
                >
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
