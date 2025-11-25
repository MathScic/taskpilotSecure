"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.log("Erreur login :", error);
      // ici tu peux ajouter un state pour afficher un message d’erreur
      return;
    }

    console.log("Login OK");
    console.log("Rôle détecté :", data.session.user.user_metadata?.role);

    // 🔥 récupère la query ?redirect=...
    const redirectTo = searchParams.get("redirect") || "/tasks";
    router.push(redirectTo);
  }

  return (
    <form
      onSubmit={handleLogin}
      className="border p-4 max-w-sm mx-auto mt-10 space-y-3"
    >
      <h1 className="text-lg font-semibold mb-2">Connexion</h1>

      <input
        type="email"
        placeholder="Email"
        className="border p-2 block w-full text-sm"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        className="border p-2 block w-full text-sm"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="submit"
        className="border p-2 w-full bg-slate-900 text-slate-50 text-sm hover:bg-slate-800 transition"
      >
        Connexion
      </button>
    </form>
  );
}
