"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { logEvent } from "@/lib/logEvent";

type Task = {
  id: string;
  title: string;
  is_done: boolean;
  created_at: string;
  user_id: string;
};

export default function AdminTasksPage() {
  const supabase = createClientComponentClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur load tasks admin:", error);
      await logEvent("error", "Erreur chargement des tâches (admin)", {
        error,
      });
    } else {
      setTasks((data as Task[]) || []);
    }
    setLoading(false);
  }

  async function toggleTask(id: string, isDone: boolean) {
    const { error } = await supabase
      .from("tasks")
      .update({ is_done: !isDone })
      .eq("id", id);

    if (error) {
      console.error("Erreur update task admin:", error);
      await logEvent("error", "Erreur update tâche (admin)", {
        task_id: id,
        error,
      });
    } else {
      await logEvent("security", "Changement d'état d'une tâche par un admin", {
        task_id: id,
        new_is_done: !isDone,
      });

      // 🔁 Mise à jour locale sans recharger la liste
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, is_done: !isDone } : task
        )
      );
    }
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("Erreur delete task admin:", error);
      await logEvent("error", "Erreur suppression tâche (admin)", {
        task_id: id,
        error,
      });
    } else {
      await logEvent("security", "Suppression d'une tâche par un admin", {
        task_id: id,
      });

      // 🗑️ Suppression en local sans reload
      setTasks((prev) => prev.filter((task) => task.id !== id));
    }
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Gestion des tâches (ADMIN)</h1>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between border p-2 rounded"
          >
            <div>
              <p className="font-medium">
                [{task.user_id.slice(0, 6)}...] {task.title}
              </p>
              <p className="text-xs text-gray-500">
                {task.created_at} – {task.is_done ? "✅ faite" : "⏳ en cours"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => void toggleTask(task.id, task.is_done)}
                className="text-sm underline"
              >
                Basculer état
              </button>
              <button
                onClick={() => void deleteTask(task.id)}
                className="text-sm text-red-600 underline"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
