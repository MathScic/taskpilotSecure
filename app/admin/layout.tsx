// app/admin/layout.tsx
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Toute la protection /admin est déjà gérée par middleware.ts
  return <>{children}</>;
}
