import { NextRequest, NextResponse } from "next/server";

import {
  clearIsLoggedInCookie,
  clearRefreshCookie,
  cookieHeaderFrom,
  forwardIsLoggedInCookie,
  forwardRefreshCookie,
  relayToBackend,
} from "../../../_lib/helpers";
import { POST } from "../route";

vi.mock("../../../_lib/helpers", () => ({
  relayToBackend: vi.fn(),
  forwardRefreshCookie: vi.fn(),
  forwardIsLoggedInCookie: vi.fn(),
  clearRefreshCookie: vi.fn(),
  clearIsLoggedInCookie: vi.fn(),
  cookieHeaderFrom: vi.fn(),
}));

describe("POST /api/auth/reissue", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshToken 쿠키를 전달하고 backendRes가 성공이면 새 쿠키를 재발급한다", async () => {
    const response = new NextResponse(null);
    vi.mocked(cookieHeaderFrom).mockReturnValue("refreshToken=abc123");
    vi.mocked(relayToBackend).mockResolvedValue({
      response,
      backendRes: new Response(null, { status: 200 }),
    });

    const request = new NextRequest("http://localhost/api/auth/reissue", { method: "POST" });

    const result = await POST(request);

    expect(relayToBackend).toHaveBeenCalledWith(
      "/api/auth/reissue",
      expect.objectContaining({ headers: { Cookie: "refreshToken=abc123" } }),
    );
    expect(forwardRefreshCookie).toHaveBeenCalledWith(response, expect.any(Response));
    expect(forwardIsLoggedInCookie).toHaveBeenCalledWith(response, expect.any(Response));
    expect(clearRefreshCookie).not.toHaveBeenCalled();
    expect(clearIsLoggedInCookie).not.toHaveBeenCalled();
    expect(result).toBe(response);
  });

  it("backendRes가 401/403으로 인증 거부되면 로컬 쿠키를 지운다", async () => {
    const response = new NextResponse(null);
    vi.mocked(cookieHeaderFrom).mockReturnValue("refreshToken=abc123");
    vi.mocked(relayToBackend).mockResolvedValue({
      response,
      backendRes: new Response(null, { status: 401 }),
    });

    const request = new NextRequest("http://localhost/api/auth/reissue", { method: "POST" });

    await POST(request);

    expect(clearRefreshCookie).toHaveBeenCalledWith(response);
    expect(clearIsLoggedInCookie).toHaveBeenCalledWith(response);
    expect(forwardRefreshCookie).not.toHaveBeenCalled();
    expect(forwardIsLoggedInCookie).not.toHaveBeenCalled();
  });

  it("backendRes가 5xx면 일시 장애로 보고 로컬 쿠키를 건드리지 않는다", async () => {
    const response = new NextResponse(null);
    vi.mocked(cookieHeaderFrom).mockReturnValue("refreshToken=abc123");
    vi.mocked(relayToBackend).mockResolvedValue({
      response,
      backendRes: new Response(null, { status: 503 }),
    });

    const request = new NextRequest("http://localhost/api/auth/reissue", { method: "POST" });

    await POST(request);

    expect(clearRefreshCookie).not.toHaveBeenCalled();
    expect(clearIsLoggedInCookie).not.toHaveBeenCalled();
    expect(forwardRefreshCookie).not.toHaveBeenCalled();
    expect(forwardIsLoggedInCookie).not.toHaveBeenCalled();
  });

  it("backendRes가 없으면(운영 차단 등) 쿠키를 건드리지 않는다", async () => {
    const response = new NextResponse(null);
    vi.mocked(cookieHeaderFrom).mockReturnValue(undefined);
    vi.mocked(relayToBackend).mockResolvedValue({ response, backendRes: null });

    const request = new NextRequest("http://localhost/api/auth/reissue", { method: "POST" });

    await POST(request);

    expect(forwardRefreshCookie).not.toHaveBeenCalled();
    expect(forwardIsLoggedInCookie).not.toHaveBeenCalled();
    expect(clearRefreshCookie).not.toHaveBeenCalled();
    expect(clearIsLoggedInCookie).not.toHaveBeenCalled();
  });
});
