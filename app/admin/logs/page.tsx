"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type LogRow = {
  id: string;
  created_at: string;
  level: string | null;
  message: string | null;
  user_id: string | null;
  context: any | null;
};

type UserLabelMap = Record<string, string>;

export default function AdminLogsPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLabels, setUserLabels] = useState<UserLabelMap>({});

  useEffect(() => {
    async function loadLogs() {
      // 1) Vérifier la session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login?redirect=/admin/logs");
        return;
      }

      // 2) Vérifier que l'utilisateur est admin (table profiles)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Erreur chargement profil :", profileError);
      }

      if (!profile || profile.role !== "admin") {
        // pas admin → redirection avec flag
        router.push("/tasks?forbidden=1");
        return;
      }

      // 3) Charger les logs
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        console.error("Erreur chargement logs:", error);
        setLoading(false);
        return;
      }

      const rows = (data as LogRow[]) ?? [];
      setLogs(rows);

      // 4) Charger les infos utilisateurs pour les logs
      const userIds = Array.from(
        new Set(rows.map((l) => l.user_id).filter(Boolean) as string[])
      );

      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        if (usersError) {
          console.error("Erreur chargement users:", usersError);
        } else if (usersData) {
          const map: UserLabelMap = {};
          for (const u of usersData) {
            map[u.id] = u.full_name || u.email || u.id;
          }
          setUserLabels(map);
        }
      }

      setLoading(false);
    }

    loadLogs();
  }, [supabase, router]);

  if (loading) {
    return (
      <main className="px-6 py-8">
        <h1 className="text-2xl font-semibold mb-2">Logs d’audit</h1>
        <p className="text-sm text-muted-foreground">Chargement des logs…</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-8">
      <h1 className="text-2xl font-semibold mb-2">Logs d’audit</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Dernières actions enregistrées sur la plateforme (max 200).
      </p>

      {logs.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
          Aucun log pour le moment.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Date</th>
                <th className="px-3 py-2 text-left font-medium">Niveau</th>
                <th className="px-3 py-2 text-left font-medium">Utilisateur</th>
                <th className="px-3 py-2 text-left font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t align-top">
                  <td className="px-3 py-2">
                    {new Date(log.created_at).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        log.level === "error"
                          ? "bg-red-100 text-red-700"
                          : log.level === "warning"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {log.level ?? "info"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {log.user_id
                      ? (userLabels[log.user_id] ?? log.user_id)
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="whitespace-pre-wrap break-words">
                      {log.message ?? "—"}
                    </div>
                    {log.context && (
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer text-blue-600">
                          Voir détails
                        </summary>
                        <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-[11px]">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
