// lib/logEvent.ts
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export type LogLevel = "info" | "warning" | "error" | "security";

export async function logEvent(
  level: LogLevel,
  message: string,
  context?: Record<string, any>
) {
  const supabase = createClientComponentClient();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id ?? null;

    const { error } = await supabase.from("logs").insert({
      level,
      message,
      user_id: userId,
      context: context ?? null,
    });

    if (error) {
      console.error("Erreur Supabase lors de l’écriture du log :", error);
    }
  } catch (error) {
    console.error("Erreur inattendue lors de l’écriture du log :", error);
  }
}
