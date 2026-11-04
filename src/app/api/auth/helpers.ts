import { NextResponse, type NextRequest } from "next/server";

import { parseSetCookieValue } from "@/utils/parseSetCookieValue";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const REFRESH_TOKEN_COOKIE = "refreshToken";

const backendUrl = (path: string) => `${BACKEND_URL}${path}`;

// 서버-투-서버 fetch는 브라우저 쿠키를 자동으로 보내지 않아 refreshToken만 수동으로 골라 첨부한다.
export function cookieHeaderFrom(request: NextRequest): string | undefined {
  const value = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  return value ? `${REFRESH_TOKEN_COOKIE}=${value}` : undefined;
}

// 백엔드 Set-Cookie를 그대로 전달하지 않고 localhost 자신의 명의로 재발급한다 (SameSite=Lax가 다른 site로는 전송되지 않기 때문).
export function forwardRefreshCookie(response: NextResponse, backendRes: Response) {
  const parsed = parseSetCookieValue(backendRes.headers.getSetCookie(), REFRESH_TOKEN_COOKIE);
  if (!parsed) return;

  response.cookies.set(REFRESH_TOKEN_COOKIE, parsed.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(parsed.maxAge !== undefined && { maxAge: parsed.maxAge }),
  });
}

export function clearRefreshCookie(response: NextResponse) {
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}

type RelayResult = {
  response: NextResponse;
  backendRes: Response | null;
};

export async function relayToBackend(path: string, init: RequestInit): Promise<RelayResult> {
  try {
    const backendRes = await fetch(backendUrl(path), init);
    const body = await backendRes.text();
    const response = new NextResponse(body, {
      status: backendRes.status,
      headers: { "Content-Type": "application/json" },
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
