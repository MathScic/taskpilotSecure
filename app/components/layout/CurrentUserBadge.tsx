"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";

type Profile = {
  full_name: string | null;
  role: string | null;
};

const supabase = createClientComponentClient();

export default function CurrentUserBadge() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadCurrentUser() {
    setLoading(true);

    // 1) User courant
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user ?? null);

    // 2) Profil associé (nom + rôle)
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      setProfile((data as Profile) ?? null);
    } else {
      setProfile(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    // chargement initial
    void loadCurrentUser();

    // on se met à jour à chaque changement d’auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadCurrentUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // États d’affichage
  if (loading) {
    return <span className="text-[11px] text-neutral-400">…</span>;
  }

  if (!user) {
    return <span className="text-[11px] text-neutral-500">Non connecté</span>;
  }

  const role = profile?.role ?? "user";
  const displayName = profile?.full_name || user.email || "Compte";
  const initial = displayName.charAt(0).toUpperCase();

  const color =
    role === "admin"
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";

  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full border ${color}`}
      >
        {initial}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-medium text-neutral-800 text-[11px]">
          {displayName}
        </span>
        <span className="uppercase tracking-wide text-[10px] text-neutral-500">
          {role === "admin" ? "ADMIN" : "USER"}
        </span>
      </div>
    </div>
  );
}
