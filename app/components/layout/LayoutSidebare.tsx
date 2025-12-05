// app/components/layout/LayoutSidebare.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Role = "admin" | "user" | null;

export default function Sidebar() {
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("SIDEBAR session =", session, "error =", sessionError);

      if (!session) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      console.log(
        "SIDEBAR profile for id =",
        session.user.id,
        "=>",
        data,
        "error =",
        error
      );

      const dbRole = (data?.role as Role) ?? "user";
      setRole(dbRole);
      setLoading(false);
    }

    void load();
  }, [supabase]);

  function NavLink({ href, label }: { href: string; label: string }) {
    const active =
      href === "/"
        ? pathname === href
        : pathname === href || pathname.startsWith(href + "/");

    return (
      <Link
        href={href}
        className={`block rounded-md px-3 py-2 text-sm transition ${
          active
            ? "bg-neutral-800 text-white"
            : "text-neutral-300 hover:bg-neutral-800/60 hover:text-white"
        }`}
      >
        {label}
      </Link>
    );
  }

  const isAdmin = role === "admin";

  return (
    <aside className="flex h-screen w-60 flex-col bg-neutral-950 text-neutral-100">
      <div className="px-4 py-4 text-sm font-semibold tracking-tight">
        TaskPilotSecure
      </div>

      <nav className="flex-1 space-y-1 px-2">
        <NavLink href="/tasks" label="Mes tâches" />

        {/* Bloc admin visible seulement si role === 'admin' */}
        {!loading && isAdmin && (
          <>
            <div className="mt-4 mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Admin
            </div>
            <NavLink href="/admin/logs" label="Logs sécurité" />
            <NavLink href="/admin/users" label="Utilisateurs" />
            <NavLink href="/admin/tasks" label="Tâches (admin)" />
          </>
        )}
      </nav>
    </aside>
  );
}
