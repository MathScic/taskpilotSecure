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
  const [userLabels, setUserLabels] = useState<UserLabelMap>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      // 1) Juste vérifier qu’on est connecté
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login?redirect=/admin/logs");
        return;
      }

      // 2) Essayer de lire les logs → RLS décidera si on a le droit
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        console.error("Erreur chargement logs:", error);
        setErrorMsg(
          "Vous n'avez pas les droits nécessaires pour consulter les logs."
        );
        setLoading(false);
        return;
      }

      const rows = (data as LogRow[]) ?? [];
      setLogs(rows);

      // 3) Charger les infos des users liés
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

    void load();
  }, [supabase, router]);

  return (
    <main className="px-6 py-8">
      <h1 className="text-2xl font-semibold mb-2">Logs d’audit</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Dernières actions enregistrées sur la plateforme (max 200).
      </p>

      {loading ? (
        <p className="text-sm text-neutral-500">Chargement…</p>
      ) : errorMsg ? (
        <p className="text-sm text-red-600">{errorMsg}</p>
      ) : logs.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-sm text-neutral-500">
          Aucun log pour le moment.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50">
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
                  <td className="px-3 py-2 text-xs text-neutral-500">
                    {log.user_id
                      ? (userLabels[log.user_id] ?? log.user_id)
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="whitespace-pre-wrap break-words">
                      {log.message ?? "—"}
                    </div>
                    {log.context && (
                      <pre className="mt-2 max-h-32 overflow-auto rounded bg-neutral-50 p-2 text-[11px]">
                        {JSON.stringify(log.context, null, 2)}
                      </pre>
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
