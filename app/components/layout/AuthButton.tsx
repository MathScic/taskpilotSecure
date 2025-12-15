"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthButton() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [hasSession, setHasSession] = useState<boolean>(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1) état initial
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setReady(true);
    });

    // 2) écoute temps réel (login/logout/refresh token)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (!ready) return null;

  if (!hasSession) {
    return (
      <Link
        href="/auth/login"
        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        Connexion
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/auth/login");
        router.refresh(); // force refresh des server components si besoin
      }}
      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
    >
      Déconnexion
    </button>
  );
}
