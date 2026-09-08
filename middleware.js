import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // Friendly redirects for common auth aliases
  const lowerPath = pathname.toLowerCase();
  const signupAliases = ["/signup", "/sign-up", "/register", "/auth/signup"];
  if (signupAliases.includes(lowerPath)) {
    const signupUrl = new URL("/auth/signin", request.url);
    signupUrl.searchParams.set("mode", "signup");
    return NextResponse.redirect(signupUrl);
  }

  const loginAliases = ["/login", "/auth/login"];
  if (loginAliases.includes(lowerPath)) {
    const loginUrl = new URL("/auth/signin", request.url);
    loginUrl.searchParams.set("mode", "login");
    return NextResponse.redirect(loginUrl);
  }

  const allowedOrigins = [
    request.nextUrl.origin,
    process.env.BETTER_AUTH_URL,
    host ? `http://${host}` : null,
    host ? `https://${host}` : null,
    "http://localhost:3000",
  ].filter(Boolean);

  // Handle CORS preflight for API routes
  if (pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      const preflightHeaders = new Headers();
      if (origin && allowedOrigins.includes(origin)) {
        preflightHeaders.set("Access-Control-Allow-Origin", origin);
        preflightHeaders.set("Access-Control-Allow-Credentials", "true");
        preflightHeaders.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        );
        preflightHeaders.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, X-Requested-With"
        );
        preflightHeaders.set("Access-Control-Max-Age", "86400");
      }
      return new NextResponse(null, { status: 204, headers: preflightHeaders });
    }
  }

  // Perimeter defense for admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const sessionToken =
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value;

    if (!sessionToken) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { message: "Authentication required" },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/auth/signin", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // Attach explicit CORS header if origin is trusted
  if (pathname.startsWith("/api/") && origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Defense-in-depth HTTP security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // Content Security Policy allowing Next.js runtime, Google Fonts, and avatar assets
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com data:;
    img-src 'self' data: blob: https://avatar.vercel.sh https://avatars.githubusercontent.com https://lh3.googleusercontent.com;
    connect-src 'self' ws: wss:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets / public image files
     */
    "/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
