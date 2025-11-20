import { z } from "zod";

export const taskTitleSchema = z
  .string()
  .min(3, "La tâche doit faire au moins 3 caractères.")
  .max(100, "La tâche doit faire moins de 100 caractères.");
