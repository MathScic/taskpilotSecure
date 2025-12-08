// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import CurrentUserBadge from "../app/components/layout/CurrentUserBadge";
import LayoutSidebar from "./components/layout/LayoutSidebare";

export const metadata: Metadata = {
  title: {
    default: "TaskPilotSecure – Gestion de tâches sécurisée",
    template: "%s – TaskPilotSecure",
  },
  description:
    "TaskPilotSecure est un SaaS de gestion de tâches avec journalisation de sécurité, rôles admin/user et contrôle d’accès renforcé.",
  metadataBase: new URL("https://taskpilotsecure.vercel.app"), // 🔁 remplace par ton domaine final
  openGraph: {
    title: "TaskPilotSecure – Gestion de tâches sécurisée",
    description:
      "Gérez vos tâches avec des règles RLS, des logs de sécurité et un dashboard admin complet.",
    url: "https://taskpilotsecure.vercel.app", // 🔁 idem
    siteName: "TaskPilotSecure",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskPilotSecure – Gestion de tâches sécurisée",
    description:
      "Application SaaS pour gérer vos tâches avec sécurité avancée (RLS, logs, rôles, etc.).",
  },
  icons: {
    icon: "/favicon.ico",
  },
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
            {/* Contenu : SEULE zone scrollable */}
            <main className="flex-1 overflow-y-auto bg-neutral-50">
              <div className="mx-auto max-w-5xl px-6 py-6">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
