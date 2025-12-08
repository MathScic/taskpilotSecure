import { ShieldCheck, Lock, EyeOff, FileText } from "lucide-react";

export default function SecurityCard() {
  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-slate-950/95 p-4 text-slate-50 shadow-sm">
      <header className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500">
          <ShieldCheck className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Sécurité active</h2>
          <p className="text-[11px] text-slate-300">
            Contrôle d&apos;accès et journalisation des actions.
          </p>
        </div>
      </header>

      <ul className="mt-2 space-y-2 text-xs text-slate-200">
        <li className="flex items-start gap-2">
          <Lock className="mt-[2px] h-3 w-3 text-emerald-400" />
          <span>
            Vos tâches sont isolées par utilisateur via des règles RLS Supabase.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <FileText className="mt-[2px] h-3 w-3 text-emerald-400" />
          <span>
            Les actions sensibles (création, modification, suppression) sont
            journalisées.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <EyeOff className="mt-[2px] h-3 w-3 text-emerald-400" />
          <span>
            Seul vous (et éventuellement les admins) pouvez voir ces
            informations.
          </span>
        </li>
      </ul>
    </article>
  );
}
