import ky, { isNetworkError } from "ky";

import { useAuthStore } from "@/store/authStore";
import { ApiError, type ApiResponse } from "@/types/api";
import { isTokenExpired } from "@/utils/isTokenExpired";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const getUrl = (path: string) => `${BASE_URL}${path}`;

function unwrap<T>(json: ApiResponse<T>): T | null {
  if (!json.success) throw new ApiError(json.error?.code ?? "UNKNOWN_ERROR", json.error?.message);
  return json.data;
}

type ReissueTokens = {
  accessToken: string;
};

// reissue 전용 인스턴스 — accessToken 만료 체크·재시도 훅이 없는 순수 ky (refreshToken은 httpOnly 쿠키로 자동 전송됨)
const baseKy = ky.create({
  credentials: "include",
  throwHttpErrors: false,
  retry: 0,
});

let refreshPromise: Promise<ReissueTokens> | null = null;

async function requestReissue(): Promise<ReissueTokens> {
  const json = await baseKy.post(getUrl("/api/auth/reissue")).json<ApiResponse<ReissueTokens>>();
  const data = unwrap(json);
  if (!data) throw new ApiError("REISSUE_FAILED", "토큰 재발급에 실패했습니다.");
  return data;
}

export function reissue(): Promise<ReissueTokens> {
  refreshPromise ??= requestReissue().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

const clientKy = ky.create({
  credentials: "include",
  throwHttpErrors: false,
  retry: {
    limit: 1,
    statusCodes: [],
    methods: ["get", "post", "put", "patch", "delete", "head"],
  },
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        let { accessToken } = useAuthStore.getState();

        if (accessToken && isTokenExpired(accessToken)) {
          const tokens = await reissue();
          useAuthStore.getState().setAccessToken(tokens.accessToken);
          accessToken = tokens.accessToken;
        }

        if (accessToken) request.headers.set("Authorization", `Bearer ${accessToken}`);
      },
    ],
    beforeError: [
      ({ error }) => {
        if (isNetworkError(error)) {
          return new ApiError("NETWORK_ERROR", "서버와 통신 중 오류가 발생했습니다.");
        }
        return error;
      },
    ],
    afterResponse: [
      async ({ request, response, retryCount }) => {
        if (response.status !== 401 || retryCount > 0) return;

        try {
          const tokens = await reissue();
          useAuthStore.getState().setAccessToken(tokens.accessToken);

          const headers = new Headers(request.headers);
          headers.set("Authorization", `Bearer ${tokens.accessToken}`);

          // 새 토큰으로 헤더를 교체한 요청을 ky에 재시도 지시 (retryCount → 1, 무한루프 방지)
          return ky.retry({
            request: new Request(request, { headers }),
            code: "TOKEN_REFRESHED",
          });
        } catch {
          useAuthStore.getState().clearAccessToken();
          throw new ApiError("AUTH_EXPIRED", "인증이 만료되었습니다. 다시 로그인해주세요.");
        }
      },
    ],
  },
});

export const clientApi = {
  get: <T>(path: string, params?: Record<string, string | number>) =>
    clientKy
      .get(getUrl(path), { searchParams: params })
      .json<ApiResponse<T>>()
      .then(json => unwrap<T>(json)),
  post: <T>(path: string, body?: unknown, options?: { timeout?: number | false }) =>
    clientKy
      .post(getUrl(path), { json: body, timeout: options?.timeout })
      .json<ApiResponse<T>>()
      .then(json => unwrap<T>(json)),
  put: <T>(path: string, body?: unknown) =>
    clientKy
      .put(getUrl(path), { json: body })
      .json<ApiResponse<T>>()
      .then(json => unwrap<T>(json)),
  patch: <T>(path: string, body?: unknown) =>
    clientKy
      .patch(getUrl(path), { json: body })
      .json<ApiResponse<T>>()
      .then(json => unwrap<T>(json)),
  delete: async <T>(path: string) => {
    const response = await clientKy.delete(getUrl(path));

    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return null as T | null;
    }

    const text = await response.text();
    if (!text) return null as T | null;

    return unwrap<T>(JSON.parse(text) as ApiResponse<T>);
  },
};

export { clientApi as api };
