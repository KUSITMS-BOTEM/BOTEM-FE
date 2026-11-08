import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isLoggedIn = Boolean(request.cookies.get("isLoggedIn"));
  const isLandingPage = request.nextUrl.pathname === "/";

  if (isLoggedIn && isLandingPage) {
    return NextResponse.redirect(new URL("/main", request.url));
  }
  if (!isLoggedIn && !isLandingPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/main/:path*"],
};
