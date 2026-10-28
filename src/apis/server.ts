import ky, { isNetworkError } from "ky";

import { ApiError, type ApiResponse } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const getUrl = (path: string) => `${BASE_URL}${path}`;

function unwrap<T>(json: ApiResponse<T>): T | null {
  if (!json.success) throw new ApiError(json.error?.code ?? "UNKNOWN_ERROR", json.error?.message);
  return json.data;
}

const serverKy = ky.create({
  throwHttpErrors: false,
  hooks: {
    beforeError: [
      ({ error }) => {
        if (isNetworkError(error)) {
          return new ApiError("NETWORK_ERROR", "서버와 통신 중 오류가 발생했습니다.");
        }
        return error;
      },
    ],
  },
});

// 서버 컴포넌트는 인증이 필요 없는 공개 GET만 담당한다 (근거: docs/decisions/server_component_auth_scope.md).
// 인증이 필요한 조회·모든 변경 요청은 src/apis/client.ts(clientApi)를 사용한다.
export const serverApi = {
  get: <T>(path: string, params?: Record<string, string | number>) =>
    serverKy
      .get(getUrl(path), { searchParams: params })
      .json<ApiResponse<T>>()
      .then(json => unwrap<T>(json)),
};
