// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/auth");
  const isTaskRoute = pathname.startsWith("/tasks");
  const isAdminRoute = pathname.startsWith("/admin");

  // 🔐 Source de vérité : table profiles
  let isAdmin = false;

  if (session) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!error && profile?.role === "admin") {
      isAdmin = true;
    }
  }

  // 1) Pas de session et on va sur /tasks ou /admin => login
  if (!session && (isTaskRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 2) Connecté et on va sur /auth => /tasks
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/tasks", req.url));
  }

  // 3) Connecté mais pas admin et on va sur /admin => /tasks avec flag forbidden
  if (session && isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/tasks?forbidden=1", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/auth/:path*", "/tasks/:path*", "/admin/:path*"],
};
