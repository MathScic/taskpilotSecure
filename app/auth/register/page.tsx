"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error(error);
      setError("Impossible de créer le compte. Vérifiez les informations.");
      setSubmitting(false);
      return;
    }

    // Selon ta config Supabase : email de confirmation ou session directe
    if (data.user) {
      setSuccess("Compte créé. Vous pouvez maintenant vous connecter.");
      // On peut rediriger au bout de 1s
      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);
    } else {
      setSuccess(
        "Inscription effectuée. Vérifiez votre email pour valider votre compte."
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-48px)] items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900 mb-1">
          Créer un compte
        </h1>
        <p className="mb-4 text-sm text-slate-500">
          Rejoignez TaskPilotSecure en quelques secondes.
        </p>

        {error && (
          <div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Nom complet
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex : Marie Dupont"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Adresse email
            </label>
            <input
              type="email"
              inputMode="email"
              autoComplete="off"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Mot de passe
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Au moins 6 caractères"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "Création du compte…" : "Créer un compte"}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-500">
          Déjà un compte ?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="text-emerald-600 hover:underline"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
