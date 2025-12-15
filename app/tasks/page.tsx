"use client";

import { Suspense } from "react";

import TasksHeader from "../components/tasks/TasksHeader";
import NewTaskForm from "../components/tasks/NewTaskForm";
import SecurityCard from "../components/tasks/SecurityCard";
import TasksList from "../components/tasks/TaskList";
import { useTasksPage } from "./useTasksPage";

function TasksPageContent() {
  const {
    forbidden,
    tasks,
    loading,
    title,
    setTitle,
    errorMessage,
    editingId,
    editingTitle,
    setEditingTitle,
    confirmDeleteId,

    // ✅ états UI
    adding,
    saving,
    deletingId,

    // ✅ toggle
    togglingId,
    toggleTask,

    // actions
    handleAddTask,
    startEdit,
    cancelEdit,
    saveEdit,
    askDelete,
    confirmDelete,
    cancelDelete,
  } = useTasksPage();

  return (
    <div className="space-y-6">
      <TasksHeader forbidden={forbidden} />

      <section className="grid gap-4 md:grid-cols-2">
        <NewTaskForm
          title={title}
          onTitleChange={setTitle}
          onSubmit={handleAddTask}
          errorMessage={errorMessage}
          submitting={adding}
        />
        <SecurityCard />
      </section>

      <TasksList
        tasks={tasks}
        loading={loading}
        editingId={editingId}
        editingTitle={editingTitle}
        onEditingTitleChange={setEditingTitle}
        onStartEdit={startEdit}
        onCancelEdit={cancelEdit}
        onSaveEdit={saveEdit}
        confirmDeleteId={confirmDeleteId}
        onAskDelete={askDelete}
        onCancelDelete={cancelDelete}
        onConfirmDelete={confirmDelete}
        saving={saving}
        deletingId={deletingId}
        togglingId={togglingId}
        onToggleTask={toggleTask}
      />
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-sm text-slate-500">
          Chargement de vos tâches…
        </div>
      }
    >
      <TasksPageContent />
    </Suspense>
  );
}
