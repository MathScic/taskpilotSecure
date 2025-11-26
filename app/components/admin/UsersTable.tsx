"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { logEvent } from "@/lib/logEvent";

export type AdminUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
};

type Props = {
  initialUsers: AdminUser[];
};

export default function UsersTable({ initialUsers }: Props) {
  const supabase = createClientComponentClient();
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function updateRole(user: AdminUser, newRole: "admin" | "user") {
    setSavingId(user.id);

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", user.id);

    if (error) {
      console.error("Erreur mise à jour rôle:", error);
      setSavingId(null);
      return;
    }

    await logEvent("info", "Rôle utilisateur modifié", {
      user_id: user.id,
      email: user.email,
      old_role: user.role,
      new_role: newRole,
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
    );
    setSavingId(null);
  }

  return (
    <div className="overflow-x-auto rounded-md border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Email</th>
            <th className="px-3 py-2 text-left font-medium">Nom</th>
            <th className="px-3 py-2 text-left font-medium">Rôle</th>
            <th className="px-3 py-2 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-3 py-2">{u.email ?? "—"}</td>
              <td className="px-3 py-2 text-neutral-500">
                {u.full_name ?? "Non renseigné"}
              </td>
              <td className="px-3 py-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.role === "admin"
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {u.role === "admin" ? "Admin" : "User"}
                </span>
              </td>
              <td className="px-3 py-2">
                {u.role === "admin" ? (
                  <button
                    type="button"
                    disabled={savingId === u.id}
                    onClick={() => void updateRole(u, "user")}
                    className="text-xs border rounded px-2 py-1 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
                  >
                    Rétrograder en user
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={savingId === u.id}
                    onClick={() => void updateRole(u, "admin")}
                    className="text-xs border rounded px-2 py-1 bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
                  >
                    Promouvoir admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
