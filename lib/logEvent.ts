// lib/logEvent.ts
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type LogLevel = "info" | "warning" | "error";

const supabase = createClientComponentClient();

export async function logEvent(
  level: LogLevel,
  message: string,
  context?: any
) {
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
