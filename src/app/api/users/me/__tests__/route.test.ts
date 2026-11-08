import { NextRequest, NextResponse } from "next/server";

import {
  clearIsLoggedInCookie,
  clearRefreshCookie,
  cookieHeaderFrom,
  relayToBackend,
} from "@/app/api/auth/helpers";

import { DELETE } from "../route";

vi.mock("@/app/api/auth/helpers", () => ({
  relayToBackend: vi.fn(),
  clearRefreshCookie: vi.fn(),
  clearIsLoggedInCookie: vi.fn(),
  cookieHeaderFrom: vi.fn(),
}));

describe("DELETE /api/users/me", () => {
  beforeEach(() => vi.clearAllMocks());

  it("탈퇴가 성공하면 로컬 쿠키를 모두 제거한다", async () => {
    const response = new NextResponse(null);
    vi.mocked(cookieHeaderFrom).mockReturnValue("refreshToken=abc123");
    vi.mocked(relayToBackend).mockResolvedValue({
      response,
      backendRes: new Response(null, { status: 200 }),
    });

    const request = new NextRequest("http://localhost/api/users/me", { method: "DELETE" });

    const result = await DELETE(request);

    expect(clearRefreshCookie).toHaveBeenCalledWith(response);
    expect(clearIsLoggedInCookie).toHaveBeenCalledWith(response);
    expect(result).toBe(response);
  });

  it("백엔드 응답이 실패면 로컬 쿠키를 제거하지 않는다", async () => {
    const response = new NextResponse(null);
    vi.mocked(cookieHeaderFrom).mockReturnValue("refreshToken=abc123");
    vi.mocked(relayToBackend).mockResolvedValue({
      response,
      backendRes: new Response(null, { status: 401 }),
    });

    const request = new NextRequest("http://localhost/api/users/me", { method: "DELETE" });

    await DELETE(request);

    expect(clearRefreshCookie).not.toHaveBeenCalled();
    expect(clearIsLoggedInCookie).not.toHaveBeenCalled();
  });
});
