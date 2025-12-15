"use client";

type Props = {
  title: string;
  onTitleChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  errorMessage: string | null;
  submitting?: boolean; // ✅ new
};

export default function NewTaskForm({
  title,
  onTitleChange,
  onSubmit,
  errorMessage,
  submitting = false,
}: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Nouvelle tâche</h2>
      <p className="mt-1 text-xs text-slate-500">
        Ajoutez une tâche personnelle (limite gérée côté DB).
      </p>

      {errorMessage && (
        <div className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ex: Appeler le client, envoyer le devis…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
          disabled={submitting}
        />

        <button
          type="submit"
          disabled={submitting || title.trim().length === 0}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Ajout…" : "Ajouter"}
        </button>
      </form>
    </section>
  );
}
