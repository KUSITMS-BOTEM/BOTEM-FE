import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value === "true";
  const isLandingPage = request.nextUrl.pathname === "/";

  if (isLoggedIn && isLandingPage) {
    return NextResponse.redirect(new URL("/home", request.url));
  }
  if (!isLoggedIn && !isLandingPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/home/:path*", "/wish/:path*", "/my/:path*"],
};
