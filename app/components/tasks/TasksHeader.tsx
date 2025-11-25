type Props = {
  forbidden: boolean;
};

export default function TasksHeader({ forbidden }: Props) {
  return (
    <>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tableau de bords des tâches</h1>
          <p className="text-sm text-neutral-500">
            Ajoutez, gérez et consultez vos tâches dans un environnement
            sécurisé.
          </p>
          <span className="text-[11px] border rounded-full px-3 py-1 text-neutral-500 bg-white">
            🔐 RBAC + RLS actifs
          </span>
        </div>
      </header>

      {forbidden && (
        <p className="mt-2 text-xs border border-amber-300 bg-amber-50 text-amber-800 rounded-md px-3 py-2">
          Vous n&apos;avez pas les droits nécessaires pour accéder à cette
          section (Logs &amp; sécurité).
        </p>
      )}
    </>
  );
}
