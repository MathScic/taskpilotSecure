// app/admin/logs/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Log = {
  id: string;
  created_at: string;
  level: string | null;
  message: string | null;
  user_id: string | null;
  context: any | null;
};

type Filter = "all" | "security" | "error" | "warning" | "info";

const LEVEL_LABELS: Record<string, string> = {
  security: "Security",
  error: "Error",
  warning: "Warning",
  info: "Info",
};

const LEVEL_CLASSES: Record<string, string> = {
  security: "bg-purple-100 text-purple-700",
  error: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-sky-100 text-sky-700",
};

export default function AdminLogsPage() {
  const supabase = createClientComponentClient();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    void loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadLogs() {
    setLoading(true);
    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200); // on évite de tout charger d'un coup

    if (error) {
      console.error("Erreur chargement logs:", error);
    } else {
      setLogs((data as Log[]) ?? []);
    }
    setLoading(false);
  }

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    const level = (log.level ?? "").toLowerCase();
    return level === filter;
  });

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("fr-FR");
  }

  function formatContext(ctx: any) {
    if (!ctx) return "—";
    try {
      const str = JSON.stringify(ctx);
      return str.length > 80 ? str.slice(0, 77) + "..." : str;
    } catch {
      return String(ctx);
    }
  }

  return (
    <main className="px-6 py-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Journal des logs</h1>
          <p className="text-sm text-neutral-500">
            Suivi des événements techniques et de sécurité.
          </p>
        </div>
        <button
          onClick={() => void loadLogs()}
          className="text-sm border rounded-md px-3 py-1.5 bg-white hover:bg-neutral-50"
        >
          Rafraîchir
        </button>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            { key: "all", label: "Tous" },
            { key: "security", label: "Security" },
            { key: "error", label: "Error" },
            { key: "warning", label: "Warning" },
            { key: "info", label: "Info" },
          ] as { key: Filter; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              filter === key
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Chargement des logs…</p>
      ) : filteredLogs.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Aucun log à afficher pour ce filtre.
        </p>
      ) : (
        <div className="rounded-md border bg-white overflow-hidden">
          {/* Conteneur scrollable interne */}
          <div className="max-h-[60vh] overflow-y-auto overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-neutral-50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Date</th>
                  <th className="px-3 py-2 text-left font-medium">Niveau</th>
                  <th className="px-3 py-2 text-left font-medium">Message</th>
                  <th className="px-3 py-2 text-left font-medium">User</th>
                  <th className="px-3 py-2 text-left font-medium">Contexte</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const lvl = (log.level ?? "").toLowerCase();
                  const badgeClass =
                    LEVEL_CLASSES[lvl] ?? "bg-neutral-100 text-neutral-700";

                  return (
                    <tr key={log.id} className="border-t">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeClass}`}
                        >
                          {LEVEL_LABELS[lvl] ?? log.level ?? "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2 max-w-xs truncate">
                        {log.message ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-[10px] text-neutral-500">
                        {log.user_id ? log.user_id.slice(0, 8) + "…" : "—"}
                      </td>
                      <td className="px-3 py-2 max-w-sm truncate text-[10px] text-neutral-500">
                        {formatContext(log.context)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
