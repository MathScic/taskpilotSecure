"use client";

import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function TasksPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <div className="border p-4">
      <p>Zone protégée : Tasks</p>
      <button onClick={handleLogout} className="border p-2 mt-4">
        Déconnexion
      </button>
    </div>
  );
}
