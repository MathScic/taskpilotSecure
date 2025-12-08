import { PlusCircle } from "lucide-react";

type NewTaskFormProps = {
  title: string;
  onTitleChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  errorMessage?: string | null;
};

export default function NewTaskForm({
  title,
  onTitleChange,
  onSubmit,
  errorMessage,
}: NewTaskFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-slate-900">Nouvelle tâche</h2>
      <p className="mt-1 text-xs text-slate-500">
        Créez une tâche à suivre dans votre espace sécurisé.
      </p>

      {errorMessage && (
        <div className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
          {errorMessage}
        </div>
      )}

      <div className="mt-3 flex-1">
        <label className="mb-1 block text-xs font-medium text-slate-700">
          Titre de la tâche
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ex : Faire une sauvegarde des données…"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <button
        type="submit"
        className="mt-3 inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        <PlusCircle className="h-4 w-4" />
        <span>Ajouter</span>
      </button>
    </form>
  );
}
