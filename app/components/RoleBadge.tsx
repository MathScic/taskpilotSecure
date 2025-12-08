"use client";

// @ts-expect-error – helper non typé dans cette version du package
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

import { useEffect, useState } from "react";

export default function RoleBadge() {
  const supabase = createBrowserSupabaseClient();
  const [role, setRole] = useState<string | null>(null);

  async function fetchRole() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRole(null);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setRole(data?.role ?? null);
  }

  useEffect(() => {
    // Charger le rôle au chargement
    fetchRole();

    // 🔥 Mettre à jour le rôle à CHAQUE changement de session
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      // On recharge le rôle dès qu'une session change
      fetchRole();
    });

    // cleanup
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!role) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <span
        className={`px-3 py-1 text-xs rounded-full shadow-md border ${
          role === "admin"
            ? "bg-red-100 border-red-300 text-red-700"
            : "bg-emerald-100 border-emerald-300 text-emerald-700"
        }`}
      >
        {role.toUpperCase()}
      </span>
    </div>
  );
}
