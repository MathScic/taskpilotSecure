"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

// Icônes Lucide
import {
  LayoutDashboard,
  ListTodo,
  ShieldCheck,
  Users,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Role = "admin" | "user" | null;

export default function LayoutSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [role, setRole] = useState<Role>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  async function loadSessionAndProfile(sb: SupabaseClient) {
    const {
      data: { session },
    } = await sb.auth.getSession();

    if (!session) {
      setRole(null);
      setEmail(null);
      setLoading(false);
      return;
    }

    setEmail(session.user.email ?? null);

    const { data } = await sb
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    const dbRole = (data?.role as Role) ?? "user";
    setRole(dbRole);
    setLoading(false);
  }

  useEffect(() => {
    loadSessionAndProfile(supabase).catch(console.error);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setRole(null);
        setEmail(null);
        return;
      }
      loadSessionAndProfile(supabase).catch(console.error);
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  useEffect(() => {
    loadSessionAndProfile(supabase).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function NavLink({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }) {
    const active =
      href === "/"
        ? pathname === href
        : pathname === href || pathname.startsWith(href + "/");

    return (
      <Link
        href={href}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
          active
            ? "bg-emerald-500 text-white"
            : "text-neutral-200 hover:bg-emerald-500/20 hover:text-white"
        }`}
      >
        <Icon className="h-4 w-4" />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  }

  const isAdmin = role === "admin";

  async function handleSignOut() {
    await supabase.auth.signOut();
    setRole(null);
    setEmail(null);
    router.push("/"); // 👈 redirection vers la home, plus vers /auth/login
  }

  return (
    <aside
      className={`flex h-screen flex-col bg-slate-950 text-neutral-100 transition-all duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header sidebar */}
      <div className="px-3 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-semibold tracking-tight">
                TaskPilotSecure
              </div>
              <div className="text-[11px] text-slate-400">
                Secure Tasks Dashboard
              </div>
            </div>
          )}
        </div>

        {/* Bouton collapse */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-800"
          aria-label={collapsed ? "Déplier la sidebar" : "Replier la sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-slate-300" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-slate-300" />
          )}
        </button>
      </div>

      {/* User / role */}
      <div className="px-3 py-3 border-b border-slate-800 text-xs">
        {email ? (
          <div className="flex items-center gap-2">
            {/* Avatar simple avec initiale */}
            <div className="h-7 w-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] font-semibold text-emerald-200">
              {email.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex flex-col gap-1">
                <span className="text-neutral-200 truncate max-w-[150px]">
                  {email}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300">
                  <ShieldCheck className="h-3 w-3" />
                  {role === "admin" ? "Admin" : "Utilisateur"}
                </span>
              </div>
            )}
          </div>
        ) : (
          !collapsed && <span className="text-slate-500">Non connecté</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3 text-sm">
        <NavLink href="/tasks" label="Mes tâches" icon={ListTodo} />

        {!loading && isAdmin && (
          <>
            {!collapsed && (
              <div className="mt-4 mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Admin
              </div>
            )}
            <NavLink
              href="/admin/logs"
              label="Logs sécurité"
              icon={ShieldCheck}
            />
            <NavLink href="/admin/users" label="Utilisateurs" icon={Users} />
            <NavLink
              href="/admin/tasks"
              label="Tâches (admin)"
              icon={ClipboardList}
            />
          </>
        )}
      </nav>

      {/* Déconnexion */}
      {email && (
        <div className="px-3 py-3 border-t border-slate-800">
          {collapsed ? (
            <button
              onClick={handleSignOut}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 hover:bg-slate-900 transition"
              aria-label="Déconnexion"
            >
              <LogOut className="h-4 w-4 text-slate-100" />
            </button>
          ) : (
            <button
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-900 hover:text-white transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
