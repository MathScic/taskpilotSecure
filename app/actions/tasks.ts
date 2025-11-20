"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function addTask(formData: FormData) {
  const supabase = createServerActionClient({ cookies });

  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    throw new Error("Titre de tâche invalide.");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Utilisateur non authentifié.");
  }

  const role = session.user.user_metadata.role;

  const { error } = await supabase.from("tasks").insert({
    title,
    user_id: session.user.id,
  });

  if (error) {
    throw new Error("Erreur d'insertion : " + error.message);
  }

  revalidatePath("/tasks");

  return { ok: true };
}
