"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { taskTitleSchema } from "@/lib/validation";
import LogoutButton from "../components/LogoutButton";
import { logEvent } from "@/lib/logEvent";

type Task = {
  id: string;
  title: string;
  is_done: boolean;
  created_at: string;
  user_id: string;
};

export default function TasksPage() {
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const forbidden = searchParams.get("forbidden") === "1";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastAddTime, setLastAddTime] = useState<number>(0);

  // États pour le CRUD
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const MAX_DAILY_TASKS = 50; // limite à 50 tâches / jour

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
      setTasks(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const now = Date.now();

    // Anti-spam : 5 secondes minimum entre deux créations
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

    // Validation Zod du titre
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

    // Vérification session utilisateur
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("Pas d'utilisateur en session");
      setErrorMessage("Session expirée, merci de vous reconnecter.");
      await logEvent("error", "Aucune session utilisateur lors de l'ajout");
      return;
    }

    // Limite journalière
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count, error: countError } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since);

    if (countError) {
      console.error("Erreur comptage de tâches :", countError);
      await logEvent("error", "Erreur comptage tâches quotidiennes", {
        error: countError,
      });
    } else if ((count ?? 0) >= MAX_DAILY_TASKS) {
      setErrorMessage(
        "Vous avez atteint la limite de tâches pour aujourd'hui, revenez demain."
      );
      await logEvent("warning", "Limite journalière de tâches atteinte", {
        user_id: user.id,
        since,
        count,
        max: MAX_DAILY_TASKS,
      });
      return;
    }

    setLastAddTime(now);

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: validTitle,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur ajout task :", error);
      setErrorMessage("Erreur serveur lors de l'ajout de la tâche.");
      await logEvent("error", "Échec création tâche", {
        title: validTitle,
        error,
      });
      return;
    }

    await logEvent("info", "Tâche créée", {
      task_id: data.id,
      title: data.title,
    });

    setTitle("");
    await loadTasks();
  }

  // --- CRUD UPDATE ---

  function startEdit(task: Task) {
    setErrorMessage(null);
    setEditingId(task.id);
    setEditingTitle(task.title);
    setConfirmDeleteId(null); // on annule une éventuelle demande de delete sur cette tâche
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

  // --- CRUD DELETE ---

  function askDelete(taskId: string) {
    setErrorMessage(null);
    setConfirmDeleteId(taskId);
    setEditingId(null); // on sort du mode édition si nécessaire
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

    await logEvent("warning", "Tâche supprimée", {
      task_id: taskId,
    });

    setConfirmDeleteId(null);
    await loadTasks();
  }

  function cancelDelete() {
    setConfirmDeleteId(null);
  }

  return (
    <div className="space-y-6">
      {/* Header de la page */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tableau de bord des tâches</h1>
          <p className="text-sm text-neutral-500">
            Ajoutez, gérez et consultez vos tâches dans un environnement
            sécurisé.
          </p>
        </div>
        <span className="text-[11px] border rounded-full px-3 py-1 text-neutral-500 bg-white">
          🔐 RBAC + RLS actifs
        </span>
      </header>

      {forbidden && (
        <p className="mt-2 text-xs border border-amber-300 bg-amber-50 text-amber-800 rounded-md px-3 py-2">
          Vous n&apos;avez pas les droits nécessaires pour accéder à cette
          section (Logs &amp; sécurité).
        </p>
      )}

      {/* Zone ajout de tâche + encart sécurité */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg bg-white p-4 space-y-3">
          <h2 className="text-sm font-medium">Nouvelle tâche</h2>
          <p className="text-xs text-neutral-500">
            Donnez un titre clair et concis. Certaines validations sont
            appliquées (longueur, anti-spam, limite quotidienne).
          </p>

          <form
            onSubmit={handleAddTask}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              className="border rounded-md p-2 flex-1 text-sm"
              placeholder="Ex : Préparer la roadmap de la semaine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button
              type="submit"
              className="border rounded-md px-3 py-2 text-sm bg-slate-900 text-slate-50 hover:bg-slate-800 transition"
            >
              Ajouter
            </button>
          </form>

          {errorMessage && (
            <p className="text-xs border border-red-200 bg-red-50 text-red-700 rounded-md px-3 py-2">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="border rounded-lg bg-white p-4 space-y-2 text-sm">
          <h2 className="text-sm font-medium">
            Sécurité appliquée sur cette page
          </h2>
          <ul className="list-disc list-inside text-xs text-neutral-600 space-y-1">
            <li>Chaque tâche est liée à votre compte (RLS en base).</li>
            <li>
              Limite de fréquence : pas de spam sur le bouton d&apos;ajout.
            </li>
            <li>Limite journalière pour éviter les abus.</li>
          </ul>
        </div>
      </section>

      {/* Liste des tâches + CRUD inline */}
      <section className="border rounded-lg bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Vos tâches</h2>
          <span className="text-[11px] text-neutral-500">
            {loading
              ? "Chargement en cours…"
              : tasks.length === 0
                ? "Aucune tâche pour le moment"
                : `${tasks.length} tâche(s)`}
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-neutral-500">Chargement…</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Vous n&apos;avez pas encore ajouté de tâche. Utilisez le formulaire
            ci-dessus pour en créer une.
          </p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="border rounded-md px-3 py-2 text-sm bg-neutral-50 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  {editingId === task.id ? (
                    <input
                      className="border rounded-md p-1 w-full text-sm"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void saveEdit(task.id);
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          cancelEdit();
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span className="truncate">{task.title}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editingId === task.id ? (
                    <>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-xs border rounded px-2 py-1 text-neutral-600 bg-white"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => void saveEdit(task.id)}
                        className="text-xs border rounded px-2 py-1 bg-slate-900 text-slate-50"
                      >
                        Enregistrer
                      </button>
                    </>
                  ) : confirmDeleteId === task.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void confirmDelete(task.id)}
                        className="text-xs border rounded px-2 py-1 bg-red-600 text-white"
                      >
                        Confirmer
                      </button>
                      <button
                        type="button"
                        onClick={cancelDelete}
                        className="text-xs border rounded px-2 py-1 text-neutral-600 bg-white"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(task)}
                        className="text-xs border rounded px-2 py-1 text-neutral-700 bg-white"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => askDelete(task.id)}
                        className="text-xs border rounded px-2 py-1 text-red-700 bg-white"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex justify-end">
        <LogoutButton />
      </div>
    </div>
  );
}
