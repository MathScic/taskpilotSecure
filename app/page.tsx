"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// @ts-expect-error – helper non typé dans cette version du package
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import {
  LayoutDashboard,
  ListTodo,
  ShieldCheck,
  Users,
  ClipboardList,
  LogIn,
} from "lucide-react";

type Role = "admin" | "user" | null;

export default function HomePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [taskCount, setTaskCount] = useState<number | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // ❌ Pas connecté → simple écran d'accueil
    if (!session) {
      setEmail(null);
      setRole(null);
      setTaskCount(null);
      setLoading(false);
      return;
    }

    // ✔️ Connecté → on récupère email et rôle
    setEmail(session.user.email ?? null);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    const dbRole = (profile?.role as Role) ?? "user";
    setRole(dbRole);

    // Nombre de tâches du user
    const { count } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id);

    setTaskCount(count ?? 0);
    setLoading(false);
  }

  const isAdmin = role === "admin";

  if (loading) {
    return <p>Chargement…</p>;
  }

  // ============================
  // 🧑‍💻 ÉCRAN NON CONNECTÉ
  // ============================
  if (!email) {
    return (
      <div className="flex min-h-[calc(100vh-48px)] flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              TaskPilotSecure
            </h1>
            <p className="text-sm text-slate-500">
              Dashboard sécurisé de gestion de tâches.
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-500 max-w-md text-center">
          Connectez-vous pour accéder à vos tâches et aux outils
          d’administration (si vous êtes admin).
        </p>

        <button
          type="button"
          onClick={() => router.push("/auth/login")}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <LogIn className="h-4 w-4" />
          Se connecter
        </button>
      </div>
    );
  }

  // ============================
  // ✔️ MINI DASHBOARD CONNECTÉ
  // ============================
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Tableau de bord</h1>
      <p className="text-sm text-slate-500">
        Bienvenue, {email} — rôle :{" "}
        <span className="font-medium">
          {isAdmin ? "Administrateur" : "Utilisateur"}
        </span>
        .
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Carte Mes tâches */}
        <button
          type="button"
          onClick={() => router.push("/tasks")}
          className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-emerald-400 hover:shadow-md transition"
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <ListTodo className="h-4 w-4 text-emerald-700" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Mes tâches</h2>
          </div>

          <p className="text-xs text-slate-500">
            Gérez vos tâches personnelles.
          </p>

          {taskCount !== null && (
            <p className="mt-1 text-xs text-slate-400">
              {taskCount === 0
                ? "Aucune tâche."
                : `${taskCount} tâche${taskCount > 1 ? "s" : ""} au total.`}
            </p>
          )}
        </button>

        {/* ADMIN ONLY */}
        {isAdmin && (
          <>
            {/* Logs */}
            <button
              type="button"
              onClick={() => router.push("/admin/logs")}
              className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-emerald-400 hover:shadow-md transition"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-cyan-700" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Journaux de sécurité
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Suivez les événements sensibles.
              </p>
            </button>

            {/* Users */}
            <button
              type="button"
              onClick={() => router.push("/admin/users")}
              className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-emerald-400 hover:shadow-md transition"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Utilisateurs
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Gérez les rôles et comptes.
              </p>
            </button>

            {/* Admin Tasks */}
            <button
              type="button"
              onClick={() => router.push("/admin/tasks")}
              className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-emerald-400 hover:shadow-md transition"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <ClipboardList className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Tâches (Admin)
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Superviser toutes les tâches.
              </p>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
