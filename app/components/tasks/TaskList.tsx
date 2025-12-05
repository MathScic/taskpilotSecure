// app/components/tasks/TasksList.tsx

type Task = {
  id: string;
  title: string;
  is_done: boolean;
  created_at: string;
  user_id: string;
};

type Props = {
  tasks: Task[];
  loading: boolean;
  editingId: string | null;
  editingTitle: string;
  onEditingTitleChange: (value: string) => void;
  onStartEdit: (task: Task) => void;
  onCancelEdit: () => void;
  onSaveEdit: (taskId: string) => void;
  confirmDeleteId: string | null;
  onAskDelete: (taskId: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (taskId: string) => void;
};

export default function TasksList({
  tasks,
  loading,
  editingId,
  editingTitle,
  onEditingTitleChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  confirmDeleteId,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: Props) {
  return (
    <section className="border rounded-lg bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium">Vos tâches</h2>
        <span className="text-[11px] text-neutral-500">
          {loading
            ? "Chargement en cours…"
            : tasks.length === 0
              ? "Aucune tâche pour le moment"
              : `${tasks.length} tâche(s)`}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Chargement…</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Vous n&apos;avez pas encore ajouté de tâche. Utilisez le formulaire
          ci-dessus pour en créer une.
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="border rounded-md px-3 py-2 text-sm bg-neutral-50 flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                {editingId === task.id ? (
                  <input
                    className="border rounded-md p-1 w-full text-sm"
                    value={editingTitle}
                    onChange={(e) => onEditingTitleChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onSaveEdit(task.id);
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        onCancelEdit();
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <span className="truncate">{task.title}</span>
                )}
              </div>
              {editingId === task.id ? (
                <>
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="text-xs border rounded px-2 py-1 text-neutral-600 bg-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => onSaveEdit(task.id)}
                    className="text-xs border rounded px-2 py-1 bg-slate-900 text-slate-50"
                  >
                    Enregistrer
                  </button>
                </>
              ) : confirmDeleteId === task.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => onConfirmDelete(task.id)}
                    className="text-xs border rounded px-2 py-1 bg-red-600 text-white"
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    onClick={onCancelDelete}
                    className="text-xs border rounded px-2 py-1 text-neutral-600 bg-white"
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <>
                  {/* Bouton EDIT = stylo */}
                  <button
                    type="button"
                    onClick={() => onStartEdit(task)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-white text-neutral-600 hover:bg-neutral-50"
                    aria-label="Modifier la tâche"
                  >
                    ✏️
                  </button>

                  {/* Bouton DELETE = poubelle rouge */}
                  <button
                    type="button"
                    onClick={() => onAskDelete(task.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-red-50 text-red-600 hover:bg-red-100"
                    aria-label="Supprimer la tâche"
                  >
                    🗑️
                  </button>
                </>
              )}

              <div className="flex items-center gap-2"></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
