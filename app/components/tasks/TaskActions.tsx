// app/components/tasks/TaskActions.tsx
"use client";

import { PencilLine, CheckCircle2, RotateCcw, Trash2 } from "lucide-react";

type TaskStatus = "todo" | "in_progress" | "done";

type Props = {
  status: TaskStatus;
  onEdit?: () => void;
  onToggleStatus?: () => void;
  onDelete?: () => void;
};

export function TaskActions({
  status,
  onEdit,
  onToggleStatus,
  onDelete,
}: Props) {
  const isDone = status === "done";

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Modifier */}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100"
          aria-label="Modifier la tâche"
        >
          <PencilLine className="h-4 w-4 text-slate-600" />
        </button>
      )}

      {/* Basculer l'état */}
      {onToggleStatus && (
        <button
          type="button"
          onClick={onToggleStatus}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
            isDone ? "hover:bg-amber-50" : "hover:bg-emerald-50"
          }`}
          aria-label={isDone ? "Repasser en à faire" : "Marquer comme terminée"}
        >
          {isDone ? (
            <RotateCcw className="h-4 w-4 text-amber-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          )}
        </button>
      )}

      {/* Supprimer */}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-rose-50"
          aria-label="Supprimer la tâche"
        >
          <Trash2 className="h-4 w-4 text-rose-600" />
        </button>
      )}
    </div>
  );
}
