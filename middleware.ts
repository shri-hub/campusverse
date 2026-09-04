import { NextResponse, type NextRequest } from "next/server";

// Routes that require a signed-in session
const protectedPrefixes = [
  "/dashboard",
  "/notices",
];

// Always-accessible routes
const publicPaths = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let auth API and static assets through untouched
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isPublic) return NextResponse.next();

  const isProtected = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!isProtected) return NextResponse.next();

  // Check for the NextAuth session cookie
  const sessionCookie =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionCookie) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
