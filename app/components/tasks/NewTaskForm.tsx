// app/components/tasks/NewTaskForm.tsx

type Props = {
  title: string;
  onTitleChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  errorMessage: string | null;
};

export default function NewTaskForm({
  title,
  onTitleChange,
  onSubmit,
  errorMessage,
}: Props) {
  return (
    <div className="border rounded-lg bg-white p-4 space-y-3">
      <h2 className="text-sm font-medium">Nouvelle tâche</h2>
      <p className="text-xs text-neutral-500">
        Donnez un titre clair et concis. Certaines validations sont appliquées
        (longueur, anti-spam, limite quotidienne).
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          className="border rounded-md p-2 flex-1 text-sm"
          placeholder="Ex : Préparer la roadmap de la semaine"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
        <button
          type="submit"
          className="border rounded-md px-3 py-2 text-sm bg-slate-900 text-slate-50 hover:bg-slate-800 transition"
        >
          Ajouter
        </button>
      </form>

      {errorMessage && (
        <p className="text-xs border border-red-200 bg-red-50 text-red-700 rounded-md px-3 py-2">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
