import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  const { pathname } = request.nextUrl;

  // If logged in and trying to access login page, redirect to home
  if (token && pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If not logged in and trying to access protected routes
  const protectedRoutes = ["/", "/admin/secret"];
  if (!token && protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

// Make sure to include all the paths you are matching in logic
export const config = {
  matcher: ["/", "/auth/login", "/admin/secret"],
};
