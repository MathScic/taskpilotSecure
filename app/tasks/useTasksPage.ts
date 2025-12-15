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

  // ✅ UI states (pro feedback)
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  // ---------- ADD ----------
  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (adding) return;
    setAdding(true);

    const now = Date.now();

    if (now - lastAddTime < 5000) {
      const diff = ((now - lastAddTime) / 1000).toFixed(1);
      setErrorMessage(
        "Veuillez attendre quelques secondes avant d'ajouter une nouvelle tâche."
      );
      await logEvent("warning", "Tentative d'ajout trop rapide de tâche", {
        since_last_add_seconds: diff,
      });
      setAdding(false);
      return;
    }

    const parse = taskTitleSchema.safeParse(title);
    if (!parse.success) {
      const message =
        parse.error.issues[0]?.message ?? "Titre de tâche invalide.";
      setErrorMessage(message);
      await logEvent("warning", "Titre de tâche invalide", {
        raw_title: title,
        issues: parse.error.issues,
      });
      setAdding(false);
      return;
    }
    const validTitle = parse.data;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("Session expirée, merci de vous reconnecter.");
      await logEvent("error", "Aucune session utilisateur lors de l'ajout");
      setAdding(false);
      return;
    }

    setLastAddTime(now);

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

      setAdding(false);
      return;
    }

    await logEvent("info", "Tâche créée", {
      task_id: data.id,
      title: data.title,
    });

    // ✅ update local direct
    setTasks((prev) => [data as Task, ...prev]);

    // ✅ reset champ
    setTitle("");
    setAdding(false);
  }

  // ---------- EDIT ----------
  function startEdit(taskId: string, currentTitle: string) {
    setErrorMessage(null);
    setEditingId(taskId);
    setEditingTitle(currentTitle);
    setConfirmDeleteId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  async function saveEdit() {
    if (!editingId) return;

    setErrorMessage(null);
    if (saving) return;
    setSaving(true);

    const parse = taskTitleSchema.safeParse(editingTitle);
    if (!parse.success) {
      const message =
        parse.error.issues[0]?.message ?? "Titre de tâche invalide.";
      setErrorMessage(message);
      await logEvent("warning", "Titre invalide lors de la modification", {
        task_id: editingId,
        raw_title: editingTitle,
        issues: parse.error.issues,
      });
      setSaving(false);
      return;
    }
    const validTitle = parse.data;

    const { error } = await supabase
      .from("tasks")
      .update({ title: validTitle })
      .eq("id", editingId);

    if (error) {
      console.error("Erreur mise à jour task :", error);
      setErrorMessage("Erreur serveur lors de la mise à jour.");
      await logEvent("error", "Échec mise à jour tâche", {
        task_id: editingId,
        title: validTitle,
        error,
      });
      setSaving(false);
      return;
    }

    await logEvent("info", "Tâche mise à jour", {
      task_id: editingId,
      new_title: validTitle,
    });

    // ✅ update local
    setTasks((prev) =>
      prev.map((t) => (t.id === editingId ? { ...t, title: validTitle } : t))
    );

    setEditingId(null);
    setEditingTitle("");
    setSaving(false);
  }

  // ---------- DELETE ----------
  function askDelete(taskId: string) {
    setErrorMessage(null);
    setConfirmDeleteId(taskId);
    setEditingId(null);
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;

    setErrorMessage(null);
    setDeletingId(confirmDeleteId);

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", confirmDeleteId);

    if (error) {
      console.error("Erreur suppression task :", error);
      setErrorMessage("Erreur serveur lors de la suppression.");
      await logEvent("error", "Échec suppression tâche", {
        task_id: confirmDeleteId,
        error,
      });
      setDeletingId(null);
      return;
    }

    await logEvent("warning", "Tâche supprimée", { task_id: confirmDeleteId });

    // ✅ remove local
    setTasks((prev) => prev.filter((t) => t.id !== confirmDeleteId));

    setConfirmDeleteId(null);
    setDeletingId(null);
  }

  function cancelDelete() {
    setConfirmDeleteId(null);
  }

  async function toggleTask(taskId: string, currentIsDone: boolean) {
    setErrorMessage(null);
    setTogglingId(taskId);

    // ✅ Optimistic UI
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_done: !currentIsDone } : t))
    );

    const { error } = await supabase
      .from("tasks")
      .update({ is_done: !currentIsDone })
      .eq("id", taskId);

    if (error) {
      // rollback
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, is_done: currentIsDone } : t
        )
      );

      console.error("Erreur toggle task :", error);
      setErrorMessage("Erreur serveur lors du changement d’état.");
      await logEvent("error", "Échec toggle état tâche", {
        task_id: taskId,
        wanted_is_done: !currentIsDone,
        error,
      });
    } else {
      await logEvent("info", "État tâche modifié", {
        task_id: taskId,
        new_is_done: !currentIsDone,
      });
    }

    setTogglingId(null);
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

    // ✅ UI states
    adding,
    saving,
    deletingId,

    // actions
    handleAddTask,
    startEdit,
    cancelEdit,
    saveEdit,
    askDelete,
    confirmDelete,
    cancelDelete,
    togglingId,
    toggleTask,
  };
}
