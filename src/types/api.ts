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

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}
