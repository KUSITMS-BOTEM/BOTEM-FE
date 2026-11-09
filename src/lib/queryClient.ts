import * as Sentry from "@sentry/nextjs";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/types/api";

// 서버가 돌려준 비즈니스 에러(ApiError)까지 보내면 알림이 잡음이 되므로 예상치 못한 에러만 보고한다.
// INVALID_RESPONSE는 502 등 게이트웨이가 HTML을 돌려준 경우라 장애 신호로 본다.
function reportUnexpectedError(error: Error) {
  if (error instanceof ApiError && error.code !== "INVALID_RESPONSE") return;
  Sentry.captureException(error);
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: error => {
      reportUnexpectedError(error);
      alert(error.message);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      reportUnexpectedError(error);
      if (mutation.meta?.skipGlobalError) return;
      alert(error.message);
    },
  }),
});
