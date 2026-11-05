import { NextRequest, NextResponse } from "next/server";

import { forwardRefreshCookie, relayToBackend } from "../../../helpers";
import { POST } from "../route";

vi.mock("../../../helpers", () => ({
  relayToBackend: vi.fn(),
  forwardRefreshCookie: vi.fn(),
}));

describe("POST /api/auth/kakao/login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("요청 body를 그대로 백엔드로 중계하고 backendRes가 있으면 쿠키를 전달한다", async () => {
    const response = new NextResponse(null);
    vi.mocked(relayToBackend).mockResolvedValue({ response, backendRes: new Response() });

    const request = new NextRequest("http://localhost/api/auth/kakao/login", {
      method: "POST",
      body: JSON.stringify({ code: "abc" }),
    });

    const result = await POST(request);

    expect(relayToBackend).toHaveBeenCalledWith(
      "/api/auth/kakao/login",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ code: "abc" }) }),
    );
    expect(forwardRefreshCookie).toHaveBeenCalledWith(response, expect.any(Response));
    expect(result).toBe(response);
  });

  it("backendRes가 없으면(운영 차단 등) 쿠키를 전달하지 않는다", async () => {
    const response = new NextResponse(null);
    vi.mocked(relayToBackend).mockResolvedValue({ response, backendRes: null });

    const request = new NextRequest("http://localhost/api/auth/kakao/login", {
      method: "POST",
      body: JSON.stringify({ code: "abc" }),
    });

    await POST(request);

    expect(forwardRefreshCookie).not.toHaveBeenCalled();
  });
});
