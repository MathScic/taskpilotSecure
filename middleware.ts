import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ⚠️ On crée un client supabase compatible middleware NEXTJS 16
  const supabase = createServerClient(
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          res.cookies.delete(name, options);
        },
      },
    }
  );

  // 🔐 Exemple : refresh auto de la session
  await supabase.auth.getSession();

  return res;
}

export const config = {
  matcher: ["/tasks/:path*", "/admin/:path*"],
};
