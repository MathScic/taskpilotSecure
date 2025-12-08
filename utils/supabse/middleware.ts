// middleware.ts
import { proxy } from "./utils/supabase/proxy";

export async function middleware(request: any) {
  return proxy(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
