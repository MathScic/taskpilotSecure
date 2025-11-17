"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log(error || "Login OK");

    if (!error && data.session) {
      console.log("Role côté client :", data.session.user.user_metadata?.role);
      router.push("/tasks");
    }
  }

  return (
    <form onSubmit={handleLogin} className="border p-4">
      <input
        type="email"
        placeholder="Email"
        className="border p-2 block mb-2"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        className="border p-2 block mb-2"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className="border p-2">
        Connexion
      </button>
    </form>
  );
}
