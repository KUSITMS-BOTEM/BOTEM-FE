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

export class ApiError extends Error {
  code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}
