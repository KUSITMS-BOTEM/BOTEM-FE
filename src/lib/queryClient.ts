import * as Sentry from "@sentry/nextjs";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { DEFAULT_ERROR_MESSAGE, ERROR_MESSAGES } from "@/constants/errorMessages";
import { useErrorDialogStore } from "@/store/errorDialogStore";
import { ApiError } from "@/types/api";

// meta 키를 타입으로 등록해, skipGlobalError 같은 키 오타를 컴파일 타임에 잡는다
declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: { skipGlobalError?: boolean };
    mutationMeta: { skipGlobalError?: boolean };
  }
}

// 서버가 돌려준 비즈니스 에러(ApiError)까지 보내면 알림이 잡음이 되므로 예상치 못한 에러만 보고한다.
// INVALID_RESPONSE(502 등 게이트웨이가 HTML을 돌려준 경우)와 NETWORK_ERROR(서버에 닿지 못한 경우)는 장애 신호로 본다.
const REPORTED_API_ERROR_CODES = ["INVALID_RESPONSE", "NETWORK_ERROR"];

function reportUnexpectedError(error: Error) {
  if (error instanceof ApiError && !REPORTED_API_ERROR_CODES.includes(error.code)) return;
  Sentry.captureException(error);
}

// action이 dialog인 코드만 전역 Dialog로 띄운다. inline·redirect·none은 호출부가 직접 처리한다
export function showGlobalErrorDialog(error: Error) {
  const entry =
    (error instanceof ApiError ? ERROR_MESSAGES[error.code] : undefined) ?? DEFAULT_ERROR_MESSAGE;
  if (entry.action === "dialog") useErrorDialogStore.getState().openErrorDialog(entry.message);
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      reportUnexpectedError(error);
      if (query.meta?.skipGlobalError) return;
      showGlobalErrorDialog(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      reportUnexpectedError(error);
      if (mutation.meta?.skipGlobalError) return;
      showGlobalErrorDialog(error);
    },
  }),
});
