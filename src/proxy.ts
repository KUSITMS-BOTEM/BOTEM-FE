import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value === "true";
  const isLandingPage = request.nextUrl.pathname === "/";
  const guestProfileUserId = request.nextUrl.pathname.match(/^\/share\/profile\/([^/]+)\/?$/)?.[1];

  // 공유받은 친구 프로필은 비로그인에게 공개하고, 로그인 사용자는 친구 프로필 화면으로 보낸다
  if (guestProfileUserId) {
    return isLoggedIn
      ? NextResponse.redirect(new URL(`/friends/${guestProfileUserId}`, request.url))
      : NextResponse.next();
  }
  if (isLoggedIn && isLandingPage) {
    return NextResponse.redirect(new URL("/home", request.url));
  }
  if (!isLoggedIn && !isLandingPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/home/:path*",
    "/wish/:path*",
    "/my/:path*",
    "/rolling-paper/:path*",
    "/friends/:path*",
    "/share/profile/:userId",
  ],
};
