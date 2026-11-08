import { NextResponse, type NextRequest } from "next/server";

import { parseSetCookieValue } from "@/utils/parseSetCookieValue";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const REFRESH_TOKEN_COOKIE = "refreshToken";
const IS_LOGGED_IN_COOKIE = "isLoggedIn";

const backendUrl = (path: string) => `${BACKEND_URL}${path}`;

// 서버-투-서버 fetch는 브라우저 쿠키를 자동으로 보내지 않아 refreshToken만 수동으로 골라 첨부한다.
export function cookieHeaderFrom(request: NextRequest): string | undefined {
  const value = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  return value ? `${REFRESH_TOKEN_COOKIE}=${value}` : undefined;
}

// 백엔드 Set-Cookie를 그대로 전달하지 않고 localhost 자신의 명의로 재발급한다 (SameSite=Lax가 다른 site로는 전송되지 않기 때문).
function syncCookieFromBackend(response: NextResponse, backendRes: Response, name: string) {
  const parsed = parseSetCookieValue(backendRes.headers.getSetCookie(), name);
  if (!parsed) return;

  response.cookies.set(name, parsed.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(parsed.maxAge !== undefined && { maxAge: parsed.maxAge }),
  });
}

export function forwardRefreshCookie(response: NextResponse, backendRes: Response) {
  syncCookieFromBackend(response, backendRes, REFRESH_TOKEN_COOKIE);
}

// proxy.ts의 로그인 가드가 isLoggedIn 쿠키를 보므로, 로컬 BFF도 refreshToken과 동일하게 재발급해야 한다.
export function forwardIsLoggedInCookie(response: NextResponse, backendRes: Response) {
  syncCookieFromBackend(response, backendRes, IS_LOGGED_IN_COOKIE);
}

export function clearRefreshCookie(response: NextResponse) {
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}

export function clearIsLoggedInCookie(response: NextResponse) {
  response.cookies.delete(IS_LOGGED_IN_COOKIE);
}

type RelayResult = {
  response: NextResponse;
  backendRes: Response | null;
};

export async function relayToBackend(path: string, init: RequestInit): Promise<RelayResult> {
  // 이 BFF는 로컬 개발 전용 우회 경로(SameSite=Lax 쿠키 문제 해결용)라, 운영 빌드에서는 호출될 일이 없어야 한다.
  if (process.env.NODE_ENV === "production") {
    const response = NextResponse.json(
      { success: false, data: null, error: { code: "NOT_FOUND", message: "Not Found" } },
      { status: 404 },
    );
    return { response, backendRes: null };
  }

  try {
    const backendRes = await fetch(backendUrl(path), init);
    const body = await backendRes.text();
    // 204/205/304는 body가 null이어야 하며, 빈 문자열이라도 넘기면 NextResponse 생성자가 던진다.
    const response = new NextResponse(body || null, {
      status: backendRes.status,
      headers: body ? { "Content-Type": "application/json" } : undefined,
    });
    return { response, backendRes };
  } catch {
    const response = NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: "BFF_RELAY_FAILED", message: "인증 서버와 통신에 실패했습니다." },
      },
      { status: 502 },
    );
    return { response, backendRes: null };
  }
}
