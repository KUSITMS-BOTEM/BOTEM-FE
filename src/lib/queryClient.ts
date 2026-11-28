import * as Sentry from "@sentry/nextjs";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { DEFAULT_ERROR_MESSAGE, ERROR_MESSAGES } from "@/constants/errorMessages";
import { useAuthStore } from "@/store/authStore";
import { useErrorDialogStore } from "@/store/errorDialogStore";
import { ApiError, AUTH_EXPIRED, REISSUE_UNAVAILABLE, SIGNED_OUT } from "@/types/api";
import { clearLoggedInCookie } from "@/utils/auth/clearLoggedInCookie";
import { setLoginReturnPath } from "@/utils/auth/loginReturnPathStorage";

// meta 키를 타입으로 등록해, skipGlobalError 같은 키 오타를 컴파일 타임에 잡는다
declare module "@tanstack/react-query" {
  interface Register {
    // quietCodes: 해당 에러 코드만 전역 안내를 건너뛴다(정상 흐름인 409 등). 나머지 에러는 그대로 안내한다
    queryMeta: { skipGlobalError?: boolean; quietCodes?: string[] };
    mutationMeta: { skipGlobalError?: boolean };
  }
}

// 서버가 돌려준 비즈니스 에러(ApiError)까지 보내면 알림이 잡음이 되므로 예상치 못한 에러만 보고한다.
// INVALID_RESPONSE(502 등 게이트웨이가 HTML을 돌려준 경우)와 NETWORK_ERROR(서버에 닿지 못한 경우)는 장애 신호로 본다.
// AUTH_005(redirect URI 설정 불일치)·UNKNOWN_ERROR(응답 계약 위반)·USER_003(외부 연동 장애)도 운영 신호로 본다.
// COMMON_001(입력 검증 실패)은 FE가 서버 조건을 놓쳤다는 뜻이라 사유(detail)와 함께 보고한다.
const REPORTED_API_ERROR_CODES = [
  "COMMON_001",
  "INVALID_RESPONSE",
  "NETWORK_ERROR",
  "AUTH_005",
  "UNKNOWN_ERROR",
  "USER_003",
];

function reportUnexpectedError(error: Error) {
  if (error instanceof ApiError && !REPORTED_API_ERROR_CODES.includes(error.code)) return;
  // 서버 문자열은 필요한 코드에만 실어 보낸다
  const detail =
    error instanceof ApiError && error.code === "COMMON_001" ? error.detail : undefined;
  Sentry.captureException(error, detail ? { extra: { detail } } : undefined);
}

function getErrorEntry(error: Error) {
  return (
    (error instanceof ApiError ? ERROR_MESSAGES[error.code] : undefined) ?? DEFAULT_ERROR_MESSAGE
  );
}

// isLoggedIn이 남아 있으면 proxy.ts가 '/'를 다시 /home으로 보내므로 쿠키까지 지운 뒤 이동한다.
// 전체 리로드라 메모리 상태(accessToken 등)도 함께 초기화된다
function redirectToLanding() {
  useAuthStore.getState().clearAccessToken();
  clearLoggedInCookie();
  // 공유 링크에서 만료되면 랜딩에서 다시 로그인한 뒤 그 링크로 돌아오게 경로를 남긴다
  const { pathname, search } = window.location;
  if (pathname.startsWith("/share/")) setLoginReturnPath(pathname + search);
  window.location.replace("/");
}

// action이 dialog인 코드만 전역 Dialog로 띄운다. inline·redirect·none은 호출부가 직접 처리한다
export function showGlobalErrorDialog(error: Error) {
  if (error instanceof ApiError && error.code === AUTH_EXPIRED) {
    showErrorDialogThen(error, redirectToLanding);
    return;
  }
  // 확인 뒤 이동할 콜백이 걸린 대화상자(인증 만료)를 다른 오류가 덮어쓰면 onClose가 사라져 이동이 누락된다
  if (useErrorDialogStore.getState().onClose) return;
  const entry = getErrorEntry(error);
  if (entry.action === "dialog") useErrorDialogStore.getState().openErrorDialog(entry.message);
}

// action과 무관하게 항상 띄운다. Dialog 확인 뒤 이어 할 동작(화면 이동 등)이 있을 때 사용한다
export function showErrorDialogThen(error: Error, onClose: () => void) {
  useErrorDialogStore.getState().openErrorDialog(getErrorEntry(error).message, onClose);
}

// 인증 만료·재발급 일시 장애·로그아웃 뒤 401은 reissue가 이미 재시도를 마친 결과라 다시 시도하면 지연만 늘어난다 (기본 retry 3회 ≈ 7초)
const NON_RETRYABLE_CODES = [AUTH_EXPIRED, REISSUE_UNAVAILABLE, SIGNED_OUT];

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        failureCount < 3 &&
        !(error instanceof ApiError && NON_RETRYABLE_CODES.includes(error.code)),
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      reportUnexpectedError(error);
      if (query.meta?.skipGlobalError) return;
      if (error instanceof ApiError && query.meta?.quietCodes?.includes(error.code)) return;
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
