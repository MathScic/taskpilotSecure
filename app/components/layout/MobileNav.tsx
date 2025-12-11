"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListTodo, Shield, Users } from "lucide-react";

const links = [
  { href: "/tasks", label: "Tâches", icon: ListTodo },
  { href: "/admin/tasks", label: "Admin", icon: Shield },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 md:hidden">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium transition
              ${
                isActive
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-700"
              }
            `}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
