import { type NextRequest } from "next/server";

import { cookieHeaderFrom, forwardRefreshCookie, relayToBackend } from "../helpers";

export async function POST(request: NextRequest) {
  const cookie = cookieHeaderFrom(request);

  const { response, backendRes } = await relayToBackend("/api/auth/reissue", {
    method: "POST",
    headers: cookie ? { Cookie: cookie } : undefined,
  });

  if (backendRes) forwardRefreshCookie(response, backendRes);
  return response;
}
