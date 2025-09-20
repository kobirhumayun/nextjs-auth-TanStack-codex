// File: src/middleware.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/pricing", "/request-password-reset", "/reset-password"];
const USER_DASHBOARD_ROUTE = "/dashboard";
const ADMIN_DASHBOARD_ROUTE = "/admin/dashboard";

// Determine whether a pathname belongs to the public marketing surface.
function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.includes(pathname);
}

// Helper to decide if the current plan is considered free-tier.
function isFreePlan(session) {
  const plan =
    session?.user?.plan?.slug ||
    session?.user?.planSlug ||
    (typeof session?.user?.plan === "string" ? session.user.plan : session?.user?.plan?.name);
  return typeof plan === "string" && plan.toLowerCase().includes("free");
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.startsWith('/api') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  const session = await auth();
  const isAuthenticated = Boolean(session?.user);

  if (isPublicRoute(pathname)) {
    if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
      const redirectUrl = session.user.role === "admin" ? ADMIN_DASHBOARD_ROUTE : USER_DASHBOARD_ROUTE;
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && session?.user?.role !== "admin") {
    return NextResponse.redirect(new URL(USER_DASHBOARD_ROUTE, request.url));
  }

  if (pathname.startsWith("/summary") && isFreePlan(session)) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  if (pathname === "/dashboard" && session?.user?.role === "admin") {
    return NextResponse.redirect(new URL(ADMIN_DASHBOARD_ROUTE, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"]
};
