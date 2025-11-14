"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log(error || "Login OK");
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
