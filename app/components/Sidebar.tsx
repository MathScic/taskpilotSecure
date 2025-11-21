"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ClipboardList,
  LogOut,
  Settings,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  {
    href: "/tasks",
    label: "Mes tâches",
    icon: ClipboardList,
  },
  {
    href: "/settings",
    label: "Paramètres",
    icon: Settings,
  },
  {
    href: "/admin/logs",
    label: "Logs sécurité",
    icon: ShieldCheck,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  // Ouverture/fermeture du menu sur mobile
  const [mobileOpen, setMobileOpen] = useState(false);
  // Mode “mini” / “plein” sur desktop
  const [collapsed, setCollapsed] = useState(false);

  function handleToggle() {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      // Sur mobile : ouvrir / fermer le bloc nav
      setMobileOpen((prev) => !prev);
    } else {
      // Sur desktop : réduire / agrandir visuellement la sidebar
      setCollapsed((prev) => !prev);
    }
  }

  const appTitle = collapsed ? "TP" : "TaskPilot Secure";

  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-900 text-slate-50 border-r transition-[width] duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Zone logo + bouton (stack vertical) */}
      <div className="flex flex-col items-center gap-2 px-3 py-4 border-b border-slate-800">
        <span className="font-semibold tracking-tight text-sm text-center truncate w-full">
          {appTitle}
        </span>

        {/* Bouton icon-only, au-dessous du logo */}
        <button
          type="button"
          onClick={handleToggle}
          className="inline-flex items-center justify-center border border-slate-700 rounded-full w-8 h-8"
        >
          {mobileOpen || collapsed ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav
        className={`
          flex-1 flex flex-col gap-1 px-2 py-3 md:px-3
          transition-[max-height,opacity] duration-300 ease-in-out
          ${mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
          md:max-h-full md:opacity-100 md:overflow-visible
        `}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm border border-slate-800 transition-colors
                ${
                  isActive
                    ? "bg-slate-800 text-slate-50"
                    : "bg-slate-900 hover:bg-slate-800/70 text-slate-200"
                }
              `}
              onClick={() => setMobileOpen(false)} // sur mobile : referme le menu après clic
            >
              <Icon className="w-4 h-4" />
              {/* Sur desktop : on cache le texte quand la sidebar est réduite, sur mobile on garde le texte */}
              <span
                className={`text-sm ${
                  collapsed ? "hidden md:inline-block md:sr-only" : "inline"
                } md:${collapsed ? "hidden" : "inline"}
                `}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bas de la sidebar : état utilisateur / bouton Quitter (futur logout) */}
      <div className="px-3 py-3 border-t border-slate-800 text-[11px] flex items-center justify-between">
        {!collapsed && <span className="text-slate-400">Connecté</span>}

        <button
          type="button"
          className="flex items-center gap-1 border border-slate-700 px-2 py-1 rounded"
        >
          <LogOut className="w-3 h-3" />
          {!collapsed && <span>Quitter</span>}
        </button>
      </div>
    </div>
  );
}
