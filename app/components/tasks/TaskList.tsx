"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  RotateCcw,
  Trash2,
  PencilLine,
  X,
  Save,
} from "lucide-react";

type Task = {
  id: string;
  title: string;
  is_done: boolean;
  created_at: string;
};

type TasksListProps = {
  tasks: Task[];
  loading: boolean;

  editingId: string | null;
  editingTitle: string;
  onEditingTitleChange: (value: string) => void;
  onStartEdit: (taskId: string, currentTitle: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;

  confirmDeleteId: string | null;
  onAskDelete: (taskId: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;

  saving?: boolean;
  deletingId?: string | null;

  // ✅ toggle
  togglingId?: string | null;
  onToggleTask?: (taskId: string, currentIsDone: boolean) => void;
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
  saving = false,
  deletingId = null,
  togglingId = null,
  onToggleTask,
}: TasksListProps) {
  if (loading) {
    return <p className="text-sm text-slate-500">Chargement de vos tâches…</p>;
  }

  if (!loading && tasks.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Vous n&apos;avez encore aucune tâche. Ajoutez-en une pour commencer.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {tasks.map((task) => {
          const isEditing = editingId === task.id;
          const isConfirmDelete = confirmDeleteId === task.id;

          const statusLabel = task.is_done ? "Terminée" : "En cours";
          const statusClasses = task.is_done
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700";

          const isDeletingThis = deletingId === task.id;
          const isTogglingThis = togglingId === task.id;

          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm"
            >
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => onEditingTitleChange(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400">
                      Modification du titre de la tâche.
                    </p>
                  </div>
                ) : (
                  <p
                    className={`font-medium ${
                      task.is_done
                        ? "text-slate-500 line-through"
                        : "text-slate-900"
                    }`}
                  >
                    {task.title}
                  </p>
                )}

                <p className="mt-1 text-xs text-neutral-500">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium mr-2 ${statusClasses}`}
                  >
                    {statusLabel}
                  </span>
                  {new Date(task.created_at).toLocaleString("fr-FR")}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={onSaveEdit}
                      disabled={saving}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-emerald-50 disabled:opacity-50"
                      aria-label="Enregistrer la modification"
                    >
                      <Save className="h-4 w-4 text-emerald-600" />
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100"
                      aria-label="Annuler la modification"
                    >
                      <X className="h-4 w-4 text-slate-500" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onStartEdit(task.id, task.title)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100"
                      aria-label="Modifier la tâche"
                    >
                      <PencilLine className="h-4 w-4 text-slate-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onAskDelete(task.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-rose-50"
                      aria-label="Supprimer la tâche"
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </button>
                  </>
                )}

                {/* ✅ Toggle état */}
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => onToggleTask?.(task.id, task.is_done)}
                    disabled={isTogglingThis}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md disabled:opacity-60 ${
                      task.is_done ? "hover:bg-amber-50" : "hover:bg-emerald-50"
                    }`}
                    aria-label={
                      task.is_done
                        ? "Repasser en cours"
                        : "Marquer comme terminée"
                    }
                  >
                    {task.is_done ? (
                      <RotateCcw className="h-4 w-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    )}
                  </button>
                )}

                {isConfirmDelete && (
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      type="button"
                      onClick={onConfirmDelete}
                      disabled={isDeletingThis}
                      className="rounded-md bg-rose-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      {isDeletingThis ? "Suppression…" : "Supprimer"}
                    </button>
                    <button
                      type="button"
                      onClick={onCancelDelete}
                      className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
