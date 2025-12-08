import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ✅ createServerClient attend 3 arguments : (url, key, options)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // on propage bien le cookie vers la response
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          res.cookies.delete(name);
        },
      },
    }
  );

  // 🔐 Force un refresh/validation de la session côté middleware
  await supabase.auth.getSession();

  return res;
}

// 👉 On applique l’auth uniquement sur ces routes
export const config = {
  matcher: ["/tasks/:path*", "/admin/:path*"],
};
