// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Middleware neutre : on laisse simplement passer la requête
  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/tasks/:path*", "/admin/:path*"],
};
