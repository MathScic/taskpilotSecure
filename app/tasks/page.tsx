"use client";

import TasksHeader from "../components/tasks/TasksHeader";
import NewTaskForm from "../components/tasks/NewTaskForm";
import SecurityCard from "../components/tasks/SecurityCard";
import TasksList from "../components/tasks/TaskList";
import { useTasksPage } from "./useTasksPage";

export default function TasksPage() {
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
      />
    </div>
  );
}
