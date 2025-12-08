type TasksHeaderProps = {
  forbidden: boolean;
};

export default function TasksHeader({ forbidden }: TasksHeaderProps) {
  if (forbidden) {
    return (
      <header className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
        <h1 className="text-sm font-semibold text-rose-800">Accès restreint</h1>
        <p className="mt-1 text-xs text-rose-700">
          Vous n&apos;êtes pas autorisé à consulter ces tâches. Si vous pensez
          qu&apos;il s&apos;agit d&apos;une erreur, contactez un administrateur.
        </p>
      </header>
    );
  }

  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-xl font-semibold text-slate-900">Mes tâches</h1>
      <p className="text-sm text-slate-500">
        Gérez vos tâches personnelles en toute sécurité avec TaskPilotSecure.
      </p>
    </header>
  );
}
