export type ApiErrorResponse = {
  code: string;
  message: string;
  detail?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: ApiErrorResponse | null;
};

// client.ts(생성)와 queryClient.ts(분기)가 함께 쓰는 인증 에러 코드
export const AUTH_EXPIRED = "AUTH_EXPIRED";
export const REISSUE_UNAVAILABLE = "REISSUE_UNAVAILABLE";

export class ApiError extends Error {
  code: string;
  // 서버가 알려주는 거절 사유. 화면에는 보여주지 않고 원인 추적에 쓴다
  detail?: string;

  constructor(code: string, message?: string, detail?: string) {
    super(message ?? code);
    this.code = code;
    this.detail = detail;
  }
}
