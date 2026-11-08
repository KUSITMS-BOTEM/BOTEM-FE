import { type NextRequest } from "next/server";

import {
  clearIsLoggedInCookie,
  clearRefreshCookie,
  cookieHeaderFrom,
  forwardIsLoggedInCookie,
  forwardRefreshCookie,
  relayToBackend,
} from "../../_lib/helpers";

export async function POST(request: NextRequest) {
  const cookie = cookieHeaderFrom(request);

  const { response, backendRes } = await relayToBackend("/api/auth/reissue", {
    method: "POST",
    headers: cookie ? { Cookie: cookie } : undefined,
  });

  if (backendRes?.ok) {
    forwardRefreshCookie(response, backendRes);
    forwardIsLoggedInCookie(response, backendRes);
  } else if (backendRes) {
    // 재발급 거부 시 로컬 isLoggedIn이 남으면 proxy가 로그인 화면 진입을 계속 막는다
    clearRefreshCookie(response);
    clearIsLoggedInCookie(response);
  }
  return response;
}
