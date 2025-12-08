"use client";

// @ts-expect-error – helper non typé dans cette version du package
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <button className="border p-2" onClick={handleLogout}>
      Se déconnecter
    </button>
  );
}
