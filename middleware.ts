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

  const role = session?.user.user_metadata.role;
  const isAdmin = role === "admin";

  //1) Si pas de session et qu'on va sur /tasks ou /admin => rediriger vers /auth/login
  if (!session && (isTaskRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  //2) Si connecté et qu'on va sur /auth => rediriger vers /tasks
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/tasks", req.url));
  }

  //3) Si connecté mais pas admin et qu'on va sur /admin => rediriger vers /tasks
  if (session && isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/tasks", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/auth/:path*", "/tasks/:path*", "/admin/:path*"],
};
