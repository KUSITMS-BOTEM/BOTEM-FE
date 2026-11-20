import { NextResponse, type NextRequest } from "next/server";

import { parseShareMemberIntent, SHARE_MEMBER_PARAM } from "@/utils/funding/shareMemberIntent";

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
    // 공유 화면에서 로그인해 돌아온 회원은 share에 머문다
    // TODO: 개설자 판별이 가능해지면 개설자만 /funding으로 보내고, 이 쿼리 예외는 없앤다
    const isReturningMember = parseShareMemberIntent(
      request.nextUrl.searchParams.get(SHARE_MEMBER_PARAM),
    );
    return isLoggedIn && !isReturningMember
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
