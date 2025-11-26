"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import UsersTable, { AdminUser } from "../../components/admin/UsersTable";

type AuthStatus = "loading" | "ok" | "forbidden";

export default function AdminUsersPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    async function load() {
      // 1) Session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login?redirect=/admin/users");
        return;
      }

      // 2) Rôle
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      console.log("[AdminUsers] session:", session.user.email);
      console.log("[AdminUsers] profile:", profile, "error:", profileError);

      if (!profile || profile.role !== "admin") {
        router.replace("/tasks?forbidden=1");
        setAuthStatus("forbidden");
        return;
      }

      setAuthStatus("ok");

      // 3) Charger tous les profils
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erreur chargement utilisateurs:", error);
      } else {
        setUsers(
          (data ?? []).map((u: any) => ({
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            role: u.role ?? "user",
          }))
        );
      }

      setLoadingUsers(false);
    }

    void load();
  }, [supabase, router]);

  if (authStatus === "loading") {
    return (
      <main className="px-6 py-8">
        <h1 className="text-2xl font-semibold mb-2">
          Gestion des utilisateurs
        </h1>
        <p className="text-sm text-neutral-500">Vérification des droits…</p>
      </main>
    );
  }

  if (authStatus === "forbidden") {
    return null;
  }

  return (
    <main className="px-6 py-8">
      <h1 className="text-2xl font-semibold mb-2">Gestion des utilisateurs</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Consultez les comptes et ajustez les rôles. Seuls les admins ont accès à
        cette page.
      </p>

      {loadingUsers ? (
        <p className="text-sm text-neutral-500">Chargement des utilisateurs…</p>
      ) : (
        <UsersTable initialUsers={users} />
      )}
    </main>
  );
}
