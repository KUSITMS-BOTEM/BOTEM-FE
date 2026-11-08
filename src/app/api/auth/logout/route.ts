import { type NextRequest } from "next/server";

import {
  clearIsLoggedInCookie,
  clearRefreshCookie,
  cookieHeaderFrom,
  relayToBackend,
} from "../../_lib/helpers";

export async function POST(request: NextRequest) {
  const cookie = cookieHeaderFrom(request);

  const { response } = await relayToBackend("/api/auth/logout", {
    method: "POST",
    headers: cookie ? { Cookie: cookie } : undefined,
  });

  // 백엔드 응답과 무관하게 로컬 쿠키는 항상 제거한다 (로그아웃은 "쿠키가 없거나 무효해도 성공"이 스펙).
  clearRefreshCookie(response);
  clearIsLoggedInCookie(response);
  return response;
}
