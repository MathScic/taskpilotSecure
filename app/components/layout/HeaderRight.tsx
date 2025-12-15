"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import AuthButton from "./AuthButton";
import CurrentUserBadge from "./CurrentUserBadge";

export default function HeaderRight() {
  const supabase = createClientComponentClient();
  const [hasSession, setHasSession] = useState<boolean>(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (!ready) return null;

  return (
    <div className="flex items-center gap-2">
      <AuthButton />
      {hasSession && <CurrentUserBadge />}
    </div>
  );
}
