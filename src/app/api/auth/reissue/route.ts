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
  } else if (backendRes?.status === 401 || backendRes?.status === 403) {
    // 재발급이 인증 거부(401/403)된 경우만 지운다 — 5xx 등 일시 장애로 로그아웃시키지 않기 위해
    clearRefreshCookie(response);
    clearIsLoggedInCookie(response);
  }
  return response;
}
