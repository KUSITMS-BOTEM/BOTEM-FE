import { type NextRequest } from "next/server";

import {
  clearIsLoggedInCookie,
  clearRefreshCookie,
  cookieHeaderFrom,
  relayToBackend,
} from "@/app/api/auth/helpers";

export async function DELETE(request: NextRequest) {
  const cookie = cookieHeaderFrom(request);
  const authorization = request.headers.get("authorization");

  const headers: Record<string, string> = {};
  if (cookie) headers.Cookie = cookie;
  if (authorization) headers.Authorization = authorization;

  const { response, backendRes } = await relayToBackend("/api/users/me", {
    method: "DELETE",
    headers,
  });

  if (backendRes?.ok) {
    clearRefreshCookie(response);
    clearIsLoggedInCookie(response);
  }
  return response;
}
