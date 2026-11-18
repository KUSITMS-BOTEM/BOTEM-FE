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
  // 로그인 사용자는 개설자·서프라이즈 대상자 판정이 가능한 회원 경로로 보낸다. 비로그인은 공개 화면 그대로
  const shareFundingId = request.nextUrl.pathname.match(/^\/share\/([^/]+)\/?$/)?.[1];
  if (shareFundingId) {
    return isLoggedIn
      ? NextResponse.redirect(new URL(`/funding/${shareFundingId}`, request.url))
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
    "/funding/:path*",
    "/share/profile/:userId",
    "/share/:fundingId",
  ],
};
