"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// @ts-expect-error – helper non typé dans cette version du package
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔐 Important : à chaque visite de /auth/login, on déconnecte
  useEffect(() => {
    void (async () => {
      await supabase.auth.signOut();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error);
      setError("Identifiants incorrects ou problème de connexion.");
      setSubmitting(false);
      return;
    }

    // Connexion OK → redirection vers /tasks (la sidebar fera le reste)
    if (data.session) {
      router.push("/tasks");
    } else {
      setError("Connexion impossible, veuillez réessayer.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-48px)] items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900 mb-1">Connexion</h1>
        <p className="mb-4 text-sm text-slate-500">
          Accédez à votre espace TaskPilotSecure.
        </p>

        {error && (
          <div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
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
              placeholder="Votre mot de passe"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-500">
          Pas encore de compte ?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/register")}
            className="text-emerald-600 hover:underline"
          >
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
}
