// app/components/tasks/TaskStatusBadge.tsx
import React from "react";

type TaskStatus = "todo" | "in_progress" | "done";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  if (status === "done") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
        Terminée
      </span>
    );
  }

  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
        En cours
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
      À faire
    </span>
  );
}
