import { type NextRequest } from "next/server";

import { forwardRefreshCookie, relayToBackend } from "../../helpers";

export async function POST(request: NextRequest) {
  const body = await request.text();

  const { response, backendRes } = await relayToBackend("/api/auth/kakao/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (backendRes) forwardRefreshCookie(response, backendRes);
  return response;
}
