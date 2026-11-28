export type ApiErrorResponse = {
  code: string;
  message: string;
  detail?: string | null;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: ApiErrorResponse | null;
};

// client.ts(생성)와 queryClient.ts(분기)가 함께 쓰는 인증 에러 코드
export const AUTH_EXPIRED = "AUTH_EXPIRED";
export const REISSUE_UNAVAILABLE = "REISSUE_UNAVAILABLE";
// 로그아웃·탈퇴 뒤 남은 요청의 401 — 사용자가 직접 끝낸 세션이라 만료 안내를 띄우지 않는다
export const SIGNED_OUT = "SIGNED_OUT";

export class ApiError extends Error {
  code: string;
  // 서버가 알려주는 거절 사유. 화면에는 보여주지 않고 원인 추적에 쓴다
  detail?: string;

  constructor(code: string, message?: string, detail?: string | null) {
    super(message ?? code);
    this.code = code;
    this.detail = detail ?? undefined;
  }
}
