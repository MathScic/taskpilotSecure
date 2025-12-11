"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type UserInfo = {
  email: string | null;
  role: string | null;
};

export default function CurrentUserBadge() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      setUser({
        email: session.user.email,
        role: profile?.role ?? null,
      });
    };

    void fetchUser();
  }, [supabase]);

  if (!user) return null;

  const initial = user.email?.[0]?.toUpperCase() ?? "?";
  const isAdmin = user.role === "admin";

  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1 text-xs sm:text-sm">
        {/* Avatar – toujours visible */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700">
          {initial}
        </div>

        {/* Infos – cachées sur mobile, visibles à partir de sm */}
        <div className="hidden sm:flex flex-col leading-tight max-w-[160px]">
          <span className="truncate text-xs font-medium text-slate-900">
            {user.email}
          </span>
          {isAdmin && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-rose-600">
              Admin
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
