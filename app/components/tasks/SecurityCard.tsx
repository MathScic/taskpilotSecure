// app/components/tasks/SecurityCard.tsx

export default function SecurityCard() {
  return (
    <div className="border rounded-lg bg-white p-4 space-y-2 text-sm">
      <h2 className="text-sm font-medium">Sécurité appliquée sur cette page</h2>
      <ul className="list-disc list-inside text-xs text-neutral-600 space-y-1">
        <li>Chaque tâche est liée à votre compte (RLS en base).</li>
        <li>Limite de fréquence : pas de spam sur le bouton d&apos;ajout.</li>
        <li>Limite journalière pour éviter les abus.</li>
      </ul>
    </div>
  );
}
