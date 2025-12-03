"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { taskTitleSchema } from "@/lib/validation";
import { logEvent } from "@/lib/logEvent";

export type Task = {
  id: string;
  title: string;
  is_done: boolean;
  created_at: string;
  user_id: string;
};

const MAX_DAILY_TASKS = 50;

export function useTasksPage() {
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const forbidden = searchParams.get("forbidden") === "1";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastAddTime, setLastAddTime] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function loadTasks() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur chargement tasks :", error);
      setErrorMessage("Impossible de charger les tâches.");
      await logEvent("error", "Échec chargement des tâches", { error });
    } else {
      setTasks((data as Task[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const now = Date.now();

    // Petit anti-spam local (5s entre deux ajouts)
    if (now - lastAddTime < 5000) {
      const diff = ((now - lastAddTime) / 1000).toFixed(1);
      setErrorMessage(
        "Veuillez attendre quelques secondes avant d'ajouter une nouvelle tâche."
      );
      await logEvent("warning", "Tentative d'ajout trop rapide de tâche", {
        since_last_add_seconds: diff,
      });
      return;
    }

    // Validation du titre
    const parse = taskTitleSchema.safeParse(title);
    if (!parse.success) {
      const message =
        parse.error.issues[0]?.message ?? "Titre de tâche invalide.";
      setErrorMessage(message);
      await logEvent("warning", "Titre de tâche invalide", {
        raw_title: title,
        issues: parse.error.issues,
      });
      return;
    }
    const validTitle = parse.data;

    // Récupération de l'utilisateur
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("Session expirée, merci de vous reconnecter.");
      await logEvent("error", "Aucune session utilisateur lors de l'ajout");
      return;
    }

    setLastAddTime(now);

    // Insert : la limite journalière est maintenant gérée par le trigger Postgres
    const { data, error } = await supabase
      .from("tasks")
      .insert({ title: validTitle, user_id: user.id })
      .select()
      .single();

    if (error || !data) {
      console.error("Erreur ajout task :", error);

      const isDailyLimitError =
        error &&
        typeof error.message === "string" &&
        error.message.includes("DAILY_TASK_LIMIT_REACHED");

      const message = isDailyLimitError
        ? "Vous avez atteint la limite de tâches pour aujourd'hui, revenez demain."
        : "Erreur serveur lors de l'ajout de la tâche.";

      setErrorMessage(message);

      await logEvent(
        isDailyLimitError ? "warning" : "error",
        isDailyLimitError
          ? "Limite journalière de tâches atteinte (enforcée côté DB)"
          : "Échec création tâche",
        {
          title: validTitle,
          user_id: user.id,
          supabaseError: error,
        }
      );

      return;
    }

    await logEvent("info", "Tâche créée", {
      task_id: data.id,
      title: data.title,
    });

    setTitle("");
    await loadTasks();
  }

  function startEdit(task: Task) {
    setErrorMessage(null);
    setEditingId(task.id);
    setEditingTitle(task.title);
    setConfirmDeleteId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  async function saveEdit(taskId: string) {
    setErrorMessage(null);

    const parse = taskTitleSchema.safeParse(editingTitle);
    if (!parse.success) {
      const message =
        parse.error.issues[0]?.message ?? "Titre de tâche invalide.";
      setErrorMessage(message);
      await logEvent("warning", "Titre invalide lors de la modification", {
        task_id: taskId,
        raw_title: editingTitle,
        issues: parse.error.issues,
      });
      return;
    }
    const validTitle = parse.data;

    const { error } = await supabase
      .from("tasks")
      .update({ title: validTitle })
      .eq("id", taskId);

    if (error) {
      console.error("Erreur mise à jour task :", error);
      setErrorMessage("Erreur serveur lors de la mise à jour.");
      await logEvent("error", "Échec mise à jour tâche", {
        task_id: taskId,
        title: validTitle,
        error,
      });
      return;
    }

    await logEvent("info", "Tâche mise à jour", {
      task_id: taskId,
      new_title: validTitle,
    });

    setEditingId(null);
    setEditingTitle("");
    await loadTasks();
  }

  function askDelete(taskId: string) {
    setErrorMessage(null);
    setConfirmDeleteId(taskId);
    setEditingId(null);
  }

  async function confirmDelete(taskId: string) {
    setErrorMessage(null);

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Erreur suppression task :", error);
      setErrorMessage("Erreur serveur lors de la suppression.");
      await logEvent("error", "Échec suppression tâche", {
        task_id: taskId,
        error,
      });
      return;
    }

    await logEvent("warning", "Tâche supprimée", { task_id: taskId });

    setConfirmDeleteId(null);
    await loadTasks();
  }

  function cancelDelete() {
    setConfirmDeleteId(null);
  }

  return {
    // état
    forbidden,
    tasks,
    loading,
    title,
    setTitle,
    errorMessage,
    editingId,
    editingTitle,
    setEditingTitle,
    confirmDeleteId,

    // actions
    handleAddTask,
    startEdit,
    cancelEdit,
    saveEdit,
    askDelete,
    confirmDelete,
    cancelDelete,
  };
}
