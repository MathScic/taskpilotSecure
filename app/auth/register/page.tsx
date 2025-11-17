"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "user",
        },
      },
    });

    console.log(error || "Register OK");

    if (!error) {
      router.push("/auth/login");
    }
  }

  return (
    <form onSubmit={handleRegister} className="border p-4">
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
        Inscription
      </button>
    </form>
  );
}
