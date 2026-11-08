import { NextRequest, NextResponse } from "next/server";

import {
  clearIsLoggedInCookie,
  clearRefreshCookie,
  cookieHeaderFrom,
  relayToBackend,
} from "../../helpers";
import { POST } from "../route";

vi.mock("../../helpers", () => ({
  relayToBackend: vi.fn(),
  clearRefreshCookie: vi.fn(),
  clearIsLoggedInCookie: vi.fn(),
  cookieHeaderFrom: vi.fn(),
}));

describe("POST /api/auth/logout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshToken 쿠키를 Cookie 헤더로 전달하고, 백엔드 응답과 무관하게 로컬 쿠키를 지운다", async () => {
    const response = new NextResponse(null);
    vi.mocked(cookieHeaderFrom).mockReturnValue("refreshToken=abc123");
    vi.mocked(relayToBackend).mockResolvedValue({ response, backendRes: null });

    const request = new NextRequest("http://localhost/api/auth/logout", { method: "POST" });

    const result = await POST(request);

    expect(relayToBackend).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ headers: { Cookie: "refreshToken=abc123" } }),
    );
    expect(clearRefreshCookie).toHaveBeenCalledWith(response);
    expect(clearIsLoggedInCookie).toHaveBeenCalledWith(response);
    expect(result).toBe(response);
  });

  it("refreshToken 쿠키가 없어도 로컬 쿠키 제거를 시도한다", async () => {
    const response = new NextResponse(null);
    vi.mocked(cookieHeaderFrom).mockReturnValue(undefined);
    vi.mocked(relayToBackend).mockResolvedValue({ response, backendRes: null });

    const request = new NextRequest("http://localhost/api/auth/logout", { method: "POST" });

    await POST(request);

    expect(relayToBackend).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ headers: undefined }),
    );
    expect(clearRefreshCookie).toHaveBeenCalledWith(response);
    expect(clearIsLoggedInCookie).toHaveBeenCalledWith(response);
  });
});
