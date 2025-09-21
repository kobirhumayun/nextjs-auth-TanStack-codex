// File: src/middleware.js
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

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

const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function readTokenFromCookies(request) {
  for (const name of SESSION_COOKIE_NAMES) {
    const value = request.cookies.get(name)?.value;
    if (value) return value;
  }
  return null;
}

function deriveSession(request) {
  const token = readTokenFromCookies(request);
  if (!token) return null;
  let payload;
  try {
    payload = jwtDecode(token);
  } catch {
    return null;
  }

  const rawUser = typeof payload?.user === "object" && payload.user ? payload.user : {};
  const user = {
    ...rawUser,
    id: payload?.id ?? payload?.sub ?? rawUser?.id ?? null,
    role: payload?.role ?? rawUser?.role ?? null,
  };

  if (payload?.plan && !user.plan) user.plan = payload.plan;
  if (payload?.planSlug && !user.planSlug) user.planSlug = payload.planSlug;
  if (typeof user.planSlug !== "string" && typeof user.plan === "string") {
    user.planSlug = user.plan;
  }

  return { user };
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname.startsWith("/api") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const session = deriveSession(request);
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
