"use client";

import { useEffect, useState } from "react";
// @ts-expect-error – helper non typé dans cette version du package
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

import { logEvent } from "@/lib/logEvent";
import {
  ShieldCheck,
  User as UserIcon,
  UserCog,
  ArrowRightLeft,
} from "lucide-react";

type Role = "admin" | "user" | null;

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
};

export default function AdminUsersPage() {
  const supabase = createBrowserSupabaseClient();
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUsers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .order("email", { ascending: true });

    if (error) {
      console.error("Erreur chargement users admin:", error);
      await logEvent("error", "Erreur chargement utilisateurs (admin)", {
        error,
      });
      setLoading(false);
      return;
    }

    setUsers((data ?? []) as ProfileRow[]);
    setLoading(false);
  }

  async function updateUserRole(id: string, newRole: Role) {
    if (!newRole) return;

    setUpdatingId(id);

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", id);

    if (error) {
      console.error("Erreur update role:", error);
      await logEvent("error", "Erreur changement rôle utilisateur", {
        user_id: id,
        role: newRole,
        error,
      });
      setUpdatingId(null);
      return;
    }

    await logEvent("warning", "Changement de rôle utilisateur", {
      user_id: id,
      new_role: newRole,
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
    setUpdatingId(null);
  }

  function roleBadge(role: Role) {
    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          <ShieldCheck className="h-3 w-3" />
          Admin
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
        <UserIcon className="h-3 w-3" />
        Utilisateur
      </span>
    );
  }

  if (loading) {
    return <p>Chargement des utilisateurs…</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Gestion des utilisateurs
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Visualisez les comptes et ajustez les rôles (admin / utilisateur).
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Utilisateur</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Rôle</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-xs text-slate-400"
                >
                  Aucun utilisateur pour le moment.
                </td>
              </tr>
            )}

            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-slate-100 hover:bg-slate-50/60"
              >
                <td className="px-3 py-2 align-middle text-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-[11px] font-semibold text-emerald-600">
                      {(user.full_name ?? user.email ?? "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {user.full_name ?? "—"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ID: {user.id.slice(0, 8)}…
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-2 align-middle text-slate-700">
                  {user.email ?? "—"}
                </td>

                <td className="px-3 py-2 align-middle">
                  {roleBadge(user.role)}
                </td>

                <td className="px-3 py-2 align-middle text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Passer admin */}
                    {user.role !== "admin" && (
                      <button
                        type="button"
                        disabled={updatingId === user.id}
                        onClick={() => updateUserRole(user.id, "admin")}
                        className="inline-flex items-center gap-1 rounded-md border border-emerald-500/60 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                      >
                        <UserCog className="h-3 w-3" />
                        <span>Rendre admin</span>
                      </button>
                    )}

                    {/* Repasser user */}
                    {user.role === "admin" && (
                      <button
                        type="button"
                        disabled={updatingId === user.id}
                        onClick={() => updateUserRole(user.id, "user")}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                      >
                        <ArrowRightLeft className="h-3 w-3" />
                        <span>Rendre user</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
