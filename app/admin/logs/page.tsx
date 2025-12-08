"use client";

import { useEffect, useState } from "react";
// @ts-expect-error – la version du package ne typise pas createClientComponentClient mais il existe bien au runtime
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { ShieldAlert, AlertTriangle, Info, User } from "lucide-react";

type LogRow = {
  id: string;
  created_at: string;
  level: string | null; // "info" | "warning" | "error"
  message: string | null;
  user_id: string | null;
  context: any | null;
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
};

type LogWithUser = LogRow & {
  user_email: string | null;
  user_name: string | null;
};

export default function AdminLogsPage() {
  const supabase = createBrowserSupabaseClient();
  const [logs, setLogs] = useState<LogWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadLogs() {
    setLoading(true);

    const { data: logsData, error } = await supabase
      .from("logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Erreur chargement logs:", error);
      setLoading(false);
      return;
    }

    const logsRows = (logsData ?? []) as LogRow[];

    const userIds = Array.from(
      new Set(logsRows.map((log) => log.user_id).filter(Boolean))
    ) as string[];

    const profilesMap = new Map<string, ProfileRow>();

    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      (profilesData ?? []).forEach((p: ProfileRow) => profilesMap.set(p.id, p));
    }

    const merged: LogWithUser[] = logsRows.map((log) => {
      const p = log.user_id ? profilesMap.get(log.user_id) : undefined;
      return {
        ...log,
        user_email: p?.email ?? null,
        user_name: p?.full_name ?? null,
      };
    });

    setLogs(merged);
    setLoading(false);
  }

  function levelBadge(level: string | null) {
    const lvl = level?.toLowerCase();

    if (lvl === "error") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
          <ShieldAlert className="h-3 w-3" />
          Erreur
        </span>
      );
    }

    if (lvl === "warning") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
          <AlertTriangle className="h-3 w-3" />
          Alerte
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
        <Info className="h-3 w-3" />
        Info
      </span>
    );
  }

  function formatUser(log: LogWithUser) {
    if (log.user_name) return log.user_name;
    if (log.user_email) return log.user_email;
    if (log.user_id) return `[${log.user_id.slice(0, 6)}…]`;
    return "Système";
  }

  if (loading) {
    return <p>Chargement des logs…</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Journaux de sécurité
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Suivi des événements sensibles : authentification, actions admin,
          erreurs d’accès, etc.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Niveau</th>
              <th className="px-3 py-2 text-left">Message</th>
              <th className="px-3 py-2 text-left">Utilisateur</th>
              <th className="px-3 py-2 text-left">Contexte</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-xs text-slate-400"
                >
                  Aucun log pour le moment.
                </td>
              </tr>
            )}

            {logs.map((log) => (
              <tr
                key={log.id}
                className="border-t border-slate-100 hover:bg-slate-50/60"
              >
                <td className="px-3 py-2 align-top text-xs text-slate-600 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString("fr-FR")}
                </td>
                <td className="px-3 py-2 align-top">{levelBadge(log.level)}</td>
                <td className="px-3 py-2 align-top text-slate-800">
                  {log.message ?? "-"}
                </td>
                <td className="px-3 py-2 align-top text-xs text-slate-700">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-400" />
                    {formatUser(log)}
                  </span>
                </td>
                <td className="px-3 py-2 align-top text-[11px] text-slate-500 max-w-xs">
                  {log.context
                    ? JSON.stringify(log.context, null, 0).slice(0, 120) +
                      (JSON.stringify(log.context).length > 120 ? "…" : "")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
