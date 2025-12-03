// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

function applySecurityHeaders(res: NextResponse) {
  // Anti-clickjacking : on ne permet pas l’inclusion dans un iframe
  res.headers.set("X-Frame-Options", "DENY");

  // Empêche le "MIME sniffing"
  res.headers.set("X-Content-Type-Options", "nosniff");

  // Limite les infos envoyées dans le header Referer
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // On désactive des APIs que l’app n’utilise pas
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Forcer le HTTPS (seulement en prod, pour éviter de casser le dev)
  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return res;
}

export async function middleware(req: NextRequest) {
  // Réponse par défaut + headers de sécu
  const res = applySecurityHeaders(NextResponse.next());
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/auth");
  const isTaskRoute = pathname.startsWith("/tasks");
  const isAdminRoute = pathname.startsWith("/admin");

  const role = session?.user.user_metadata.role;
  const isAdmin = role === "admin";

  // 1) Pas de session et on va sur /tasks ou /admin => login
  if (!session && (isTaskRoute || isAdminRoute)) {
    const redirectUrl = new URL("/auth/login", req.url);
    return applySecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  // 2) Connecté et on va sur /auth => /tasks
  if (session && isAuthRoute) {
    const redirectUrl = new URL("/tasks", req.url);
    return applySecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  // 3) Connecté mais pas admin et on va sur /admin => /tasks
  if (session && isAdminRoute && !isAdmin) {
    const redirectUrl = new URL("/tasks", req.url);
    return applySecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
