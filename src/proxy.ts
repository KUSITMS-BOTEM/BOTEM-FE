import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hasRefreshToken = Boolean(request.cookies.get("refreshToken"));
  const isLandingPage = request.nextUrl.pathname === "/";

  if (hasRefreshToken && isLandingPage) {
    return NextResponse.redirect(new URL("/main", request.url));
  }
  if (!hasRefreshToken && !isLandingPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/main/:path*"],
};
