"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function addTask(formData: FormData) {
  const supabase = createServerComponentClient({ cookies });

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

  // On n'utilise plus user_metadata.role ici,
  // la sécurité est gérée par RLS + UI + rôle en base (profiles)

  const { error } = await supabase.from("tasks").insert({
    title,
    user_id: session.user.id,
  });

  if (error) {
    throw new Error("Erreur d'insertion : " + error.message);
  }

  // On invalide la liste des tâches pour forcer le refresh côté /tasks
  revalidatePath("/tasks");

  return { ok: true };
}
