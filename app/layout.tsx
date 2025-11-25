import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./components/Sidebar";
import { PageShell } from "./components/PageShell";
import RoleBadge from "./components/RoleBadge";

export const metadata: Metadata = {
  title: "TaskPilot Secure",
  description:
    "SaaS de tâches avec sécurité avancée (RBAC, RLS, audit, protections anti-abus).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-neutral-50">
        <div className="flex min-h-screen">
          {/* Sidebar desktop */}
          <aside className="hidden md:block">
            <Sidebar />
          </aside>

          {/* Sidebar mobile */}
          <div className="md:hidden w-full">
            <Sidebar />
          </div>

          {/* Contenu principal avec transitions fluide */}
          <main className="flex-1 px-4 py-6 md:px-8">
            <div className="max-w-3xl mx-auto">
              <PageShell>{children}</PageShell>
            </div>
          </main>
        </div>
        <RoleBadge />
      </body>
    </html>
  );
}
