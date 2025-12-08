// lib/logEvent.ts
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export type LogLevel = "info" | "warning" | "error";

export async function logEvent(
  level: LogLevel,
  message: string,
  context?: any
) {
  // ⚠️ Client créé à chaque appel → toujours la session à jour
  const supabase = createClientComponentClient();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id ?? null;

    await supabase.from("logs").insert({
      level,
      message,
      user_id: userId,
      context: context ?? null,
    });
  } catch (error) {
    console.error("Erreur lors de l’écriture du log :", error);
  }
}
