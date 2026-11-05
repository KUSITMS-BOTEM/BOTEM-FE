import { NextRequest, NextResponse } from "next/server";

import { cookieHeaderFrom, forwardRefreshCookie, relayToBackend } from "../../helpers";
import { POST } from "../route";

vi.mock("../../helpers", () => ({
  relayToBackend: vi.fn(),
  forwardRefreshCookie: vi.fn(),
  cookieHeaderFrom: vi.fn(),
}));

describe("POST /api/auth/reissue", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshToken 쿠키를 전달하고 backendRes가 있으면 새 쿠키를 재발급한다", async () => {
    const response = new NextResponse(null);
    vi.mocked(cookieHeaderFrom).mockReturnValue("refreshToken=abc123");
    vi.mocked(relayToBackend).mockResolvedValue({ response, backendRes: new Response() });

    const request = new NextRequest("http://localhost/api/auth/reissue", { method: "POST" });

    const result = await POST(request);

    expect(relayToBackend).toHaveBeenCalledWith(
      "/api/auth/reissue",
      expect.objectContaining({ headers: { Cookie: "refreshToken=abc123" } }),
    );
    expect(forwardRefreshCookie).toHaveBeenCalledWith(response, expect.any(Response));
    expect(result).toBe(response);
  });

  it("backendRes가 없으면(운영 차단 등) 쿠키를 재발급하지 않는다", async () => {
    const response = new NextResponse(null);
    vi.mocked(cookieHeaderFrom).mockReturnValue(undefined);
    vi.mocked(relayToBackend).mockResolvedValue({ response, backendRes: null });

    const request = new NextRequest("http://localhost/api/auth/reissue", { method: "POST" });

    await POST(request);

    expect(forwardRefreshCookie).not.toHaveBeenCalled();
  });
});
