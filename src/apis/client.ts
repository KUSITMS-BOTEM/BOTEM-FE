import ky, { isNetworkError } from "ky";

import { useAuthStore } from "@/store/authStore";
import { ApiError, type ApiResponse, AUTH_EXPIRED, REISSUE_UNAVAILABLE } from "@/types/api";
import { isTokenExpired } from "@/utils/isTokenExpired";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const getUrl = (path: string) => `${BASE_URL}${path}`;
// 로컬 개발(localhost)은 운영 백엔드와 다른 site라 SameSite=Lax인 refreshToken 쿠키가 전송되지 않는다 —
// 쿠키를 다루는 인증 엔드포인트만 로컬에서 BFF(src/app/api/auth/*)로 우회한다.
const getAuthUrl = (path: string) => (process.env.NODE_ENV === "production" ? getUrl(path) : path);

function unwrap<T>(json: ApiResponse<T>): T | null {
  if (!json.success) throw new ApiError(json.error?.code ?? "UNKNOWN_ERROR", json.error?.message);
  return json.data;
}

// 502 등 게이트웨이 오류는 JSON이 아닌 HTML body를 반환해 JSON.parse가 SyntaxError를 던진다 —
// 전역 에러 핸들러가 error.message를 그대로 노출하므로 사용자에게 보여줄 수 있는 ApiError로 바꿔준다.
function toJsonParseError(error: unknown): never {
  if (error instanceof SyntaxError) {
    throw new ApiError("INVALID_RESPONSE", "서버 응답을 처리할 수 없습니다.");
  }
  throw error;
}

async function parseDeleteResponse<T>(response: Response): Promise<T | null> {
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return null;
  }

  const text = await response.text();
  if (!text) return null;

  try {
    return unwrap<T>(JSON.parse(text) as ApiResponse<T>);
  } catch (error) {
    return toJsonParseError(error);
  }
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

// 시도 1회당 timeout — 즉시 재시도 1회를 포함한 최악 대기 시간이 5초(2 × 2.5초)가 되도록 잡는다
const REISSUE_TIMEOUT_MS = 2500;

// 인증 거부(401/403)와 달리 5xx·408·429·timeout·네트워크 오류·비JSON 4xx(게이트웨이)는 refreshToken이 유효할 수 있는 일시 장애다
async function requestReissueOnce(): Promise<ReissueTokens> {
  const unavailable = () =>
    new ApiError(REISSUE_UNAVAILABLE, "토큰 재발급이 일시적으로 실패했습니다.");

  let response: Response;
  try {
    response = await baseKy.post(getAuthUrl("/api/auth/reissue"), { timeout: REISSUE_TIMEOUT_MS });
  } catch {
    throw unavailable();
  }
  if (response.status >= 500 || response.status === 408 || response.status === 429) {
    throw unavailable();
  }

  let json: ApiResponse<ReissueTokens>;
  try {
    json = (await response.json()) as ApiResponse<ReissueTokens>;
  } catch (error) {
    // 401/403은 본문이 비어 있어도 인증 거부다 — 그 외 비JSON 4xx만 게이트웨이 장애로 본다
    if (!response.ok && response.status !== 401 && response.status !== 403) throw unavailable();
    return toJsonParseError(error);
  }
  const data = unwrap(json);
  if (!data) throw new ApiError("REISSUE_FAILED", "토큰 재발급에 실패했습니다.");
  return data;
}

async function requestReissue(): Promise<ReissueTokens> {
  try {
    return await requestReissueOnce();
  } catch (error) {
    if (error instanceof ApiError && error.code === REISSUE_UNAVAILABLE) {
      return requestReissueOnce();
    }
    throw error;
  }
}

export function reissue(): Promise<ReissueTokens> {
  refreshPromise ??= requestReissue().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

// beforeRequest(선제 재발급)·afterResponse(401 재시도) 양쪽에서 재발급 실패를 동일하게 처리한다.
async function reissueOrThrow(): Promise<ReissueTokens> {
  try {
    return await reissue();
  } catch (error) {
    // 일시 장애는 로그아웃으로 처리하지 않는다 — accessToken을 유지하고 호출부가 "다시 시도"를 안내한다
    if (error instanceof ApiError && error.code === REISSUE_UNAVAILABLE) throw error;
    useAuthStore.getState().clearAccessToken();
    throw new ApiError(AUTH_EXPIRED, "인증이 만료되었습니다. 다시 로그인해주세요.");
  }
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
          const tokens = await reissueOrThrow();
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

        const tokens = await reissueOrThrow();
        useAuthStore.getState().setAccessToken(tokens.accessToken);

        const headers = new Headers(request.headers);
        headers.set("Authorization", `Bearer ${tokens.accessToken}`);

        // 새 토큰으로 헤더를 교체한 요청을 ky에 재시도 지시 (retryCount → 1, 무한루프 방지)
        return ky.retry({
          request: new Request(request, { headers }),
          code: "TOKEN_REFRESHED",
        });
      },
    ],
  },
});

export const clientApi = {
  get: <T>(path: string, params?: Record<string, string | number>) =>
    clientKy
      .get(getUrl(path), { searchParams: params })
      .json<ApiResponse<T>>()
      .then(json => unwrap<T>(json), toJsonParseError),
  post: <T>(path: string, body?: unknown, options?: { timeout?: number | false }) =>
    clientKy
      .post(getUrl(path), { json: body, timeout: options?.timeout })
      .json<ApiResponse<T>>()
      .then(json => unwrap<T>(json), toJsonParseError),
  // 쿠키(refreshToken)를 다루는 엔드포인트 전용 — 로컬 개발은 BFF(getAuthUrl)로 우회
  postAuth: <T>(path: string, body?: unknown) =>
    clientKy
      .post(getAuthUrl(path), { json: body })
      .json<ApiResponse<T>>()
      .then(json => unwrap<T>(json), toJsonParseError),
  put: <T>(path: string, body?: unknown) =>
    clientKy
      .put(getUrl(path), { json: body })
      .json<ApiResponse<T>>()
      .then(json => unwrap<T>(json), toJsonParseError),
  patch: <T>(path: string, body?: unknown) =>
    clientKy
      .patch(getUrl(path), { json: body })
      .json<ApiResponse<T>>()
      .then(json => unwrap<T>(json), toJsonParseError),
  delete: <T>(path: string) =>
    clientKy.delete(getUrl(path)).then(response => parseDeleteResponse<T>(response)),
  // 쿠키(refreshToken)를 다루는 엔드포인트 전용 — 로컬 개발은 BFF(getAuthUrl)로 우회
  deleteAuth: <T>(path: string) =>
    clientKy.delete(getAuthUrl(path)).then(response => parseDeleteResponse<T>(response)),
};

export { clientApi as api };
