import { delay, http, HttpResponse } from "msw";

import { clearMockAuthCookies } from "@/mocks/mockAuthCookies";

export const userHandlers = [
  // NEXT_PUBLIC_API_BASE_URL(절대 cross-origin URL)로 나가는 요청이라 origin 무관 매칭(`*/`)이 필요하다
  http.get("*/api/users/me/profile", () => {
    return HttpResponse.json({
      success: true,
      data: {
        nickname: "지유",
        profileImageUrl: "https://example.com/profile.jpg",
        birthday: "10-13",
        wishProfileUrl: "https://botem.site/@8f0c6d779fae47f3a979302f2782d20f",
        kakaoConnected: true,
      },
      error: null,
    });
  }),
  // "시작하기" 버튼의 loading 상태를 눈으로 확인할 수 있게 지연을 둔다
  http.post("*/api/users/me/onboarding", async () => {
    await delay(800);
    return HttpResponse.json({ success: true, data: null, error: null });
  }),
  http.delete("/api/users/me", () => {
    clearMockAuthCookies();

    return HttpResponse.json({ success: true, data: null, error: null });
  }),
];
