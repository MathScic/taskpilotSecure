"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { taskTitleSchema } from "@/lib/validation";
import LogoutButton from "../components/LogoutButton";

// Cache simple basé sur l'IP (MVP)
const ipRateLimitMap = new Map<string, number>();

type Task = {
  id: string;
  title: string;
  is_done: boolean;
  created_at: string;
};

export default function TasksPage() {
  const supabase = createClientComponentClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const MAX_DAILY_TASKS = 50; // limite à 50 tâches / jour

  async function loadTasks() {
    setLoading(true);

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur chargement tasks :", error);
    } else {
      setTasks(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function getUserIP() {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      return data.ip as string;
    } catch {
      return "unknown-ip";
    }
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();

    setErrorMessage(null); // reset erreur

    // === Rate limiting par IP ===
    const userIP = await getUserIP();
    const now = Date.now();
    const lastIPTime = ipRateLimitMap.get(userIP) ?? 0;

    // 5 secondes entre deux actions par IP
    if (now - lastIPTime < 5000) {
      setErrorMessage(
        "Votre IP effectue trop d'actions. Veuillez patienter quelques secondes."
      );
      return;
    }

    ipRateLimitMap.set(userIP, now);

    // Validation Zod
    const result = taskTitleSchema.safeParse(title);

    if (!result.success) {
      const message =
        result.error.issues[0]?.message ?? "Titre de tâche invalide.";
      setErrorMessage(message);
      return;
    }

    const validTitle = result.data;

    // Vérifie la session user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("Pas d'utilisateur en session");
      return;
    }

    // Limite les tâches par jour pour ce user
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count, error: countError } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since);

    if (countError) {
      console.error("Erreur comptage de tâches : ", countError);
    } else if ((count ?? 0) >= MAX_DAILY_TASKS) {
      setErrorMessage(
        "Vous avez atteint la limite de tâches pour aujourd'hui, revenez demain !"
      );
      return;
    }

    // Ajout de la task sécurisée
    const { error } = await supabase.from("tasks").insert({
      title: validTitle,
      user_id: user.id,
    });

    if (error) {
      console.error("Erreur ajout task :", error);
      setErrorMessage("Erreur serveur lors de l'ajout de la tâche.");
      return;
    }

    setTitle("");
    await loadTasks();
  }

  return (
    <div className="border p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="font-bold">Tasks sécurisées</h1>
        <LogoutButton />
      </div>

      <form onSubmit={handleAddTask} className="space-x-2">
        <input
          className="border p-2"
          placeholder="Nouvelle task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit" className="border p-2">
          Ajouter
        </button>
      </form>

      {errorMessage && (
        <p className="border p-2 text-red-600">{errorMessage}</p>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ul className="space-y-1">
          {tasks.map((task) => (
            <li key={task.id} className="border p-2">
              {task.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
