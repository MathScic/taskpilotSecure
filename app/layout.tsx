// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import CurrentUserBadge from "../app/components/layout/CurrentUserBadge";
import LayoutSidebar from "./components/layout/LayoutSidebare";

export const metadata: Metadata = {
  title: "TaskPilotSecure",
  description: "SaaS de tâches sécurisée",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-neutral-50">
        <div className="flex min-h-screen max-h-screen overflow-hidden">
          <LayoutSidebar />
          <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
            <header className="flex items-center justify-between px-4 py-2 border-b bg-white">
              <h1 className="text-sm font-semibold text-neutral-700">
                TaskPilotSecure
              </h1>
              <CurrentUserBadge />
            </header>
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
