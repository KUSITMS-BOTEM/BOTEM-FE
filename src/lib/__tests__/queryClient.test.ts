import * as Sentry from "@sentry/nextjs";

import { queryClient } from "../queryClient";
import { useAuthStore } from "@/store/authStore";
import { useErrorDialogStore } from "@/store/errorDialogStore";
import { ApiError } from "@/types/api";
import { clearLoggedInCookie } from "@/utils/auth/clearLoggedInCookie";
import { consumeLoginReturnPath } from "@/utils/auth/loginReturnPathStorage";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
vi.mock("@/utils/auth/clearLoggedInCookie", () => ({ clearLoggedInCookie: vi.fn() }));

const failQuery = (error: Error, meta?: { skipGlobalError: boolean }) =>
  queryClient
    .fetchQuery({
      queryKey: [Math.random()],
      queryFn: () => Promise.reject(error),
      retry: false,
      meta,
    })
    .catch(() => undefined);

describe("queryClient 전역 onError", () => {
  afterEach(() => {
    useErrorDialogStore.getState().closeErrorDialog();
  });

  it("action이 dialog인 코드는 테이블 메시지로 Dialog를 띄운다", async () => {
    await failQuery(new ApiError("USER_002", "서버 원문 메시지"));

    expect(useErrorDialogStore.getState().message).toBe(
      "진행 중인 펀딩이 끝난 뒤 탈퇴할 수 있어요.",
    );
  });

  it("테이블에 없는 코드는 기본 메시지로 Dialog를 띄운다", async () => {
    await failQuery(new ApiError("NOT_IN_TABLE"));

    expect(useErrorDialogStore.getState().message).toBe(
      "일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
    );
  });

  it("ApiError가 아닌 에러도 기본 메시지로 Dialog를 띄운다", async () => {
    await failQuery(new TypeError("boom"));

    expect(useErrorDialogStore.getState().message).toBe(
      "일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
    );
  });

  it("action이 dialog가 아닌 코드(none·inline)는 Dialog를 띄우지 않는다", async () => {
    await failQuery(new ApiError("WISH_002"));
    await failQuery(new ApiError("PRODUCT_003"));

    expect(useErrorDialogStore.getState().message).toBeNull();
  });

  it("skipGlobalError meta가 있으면 Dialog를 띄우지 않는다", async () => {
    await failQuery(new ApiError("USER_002"), { skipGlobalError: true });

    expect(useErrorDialogStore.getState().message).toBeNull();
  });

  it("운영 신호 코드만 Sentry에 보고한다", async () => {
    vi.mocked(Sentry.captureException).mockClear();

    await failQuery(new ApiError("USER_002"));
    expect(Sentry.captureException).not.toHaveBeenCalled();

    for (const code of ["AUTH_005", "UNKNOWN_ERROR", "USER_003"]) {
      await failQuery(new ApiError(code));
    }
    expect(Sentry.captureException).toHaveBeenCalledTimes(3);
  });
});

describe("queryClient 인증 에러 처리", () => {
  const replace = vi.fn();

  beforeEach(() => {
    replace.mockClear();
    vi.mocked(clearLoggedInCookie).mockClear();
    vi.stubGlobal("location", { ...window.location, replace });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useErrorDialogStore.getState().closeErrorDialog();
  });

  it("AUTH_EXPIRED는 Dialog 확인 시 토큰·isLoggedIn을 지우고 '/'로 이동한다", async () => {
    useAuthStore.getState().setAccessToken("token");
    await failQuery(new ApiError("AUTH_EXPIRED"));

    expect(useErrorDialogStore.getState().message).toBe(
      "인증이 만료되었습니다. 다시 로그인해주세요.",
    );
    expect(replace).not.toHaveBeenCalled();

    useErrorDialogStore.getState().closeErrorDialog();

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(clearLoggedInCookie).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("공유 링크에서 AUTH_EXPIRED가 나면 Dialog 확인 시 그 경로를 로그인 복귀 경로로 남긴다", async () => {
    sessionStorage.clear();
    vi.stubGlobal("location", {
      ...window.location,
      pathname: "/share/abc",
      search: "?member=guest",
      replace,
    });
    await failQuery(new ApiError("AUTH_EXPIRED"));
    useErrorDialogStore.getState().closeErrorDialog();

    expect(consumeLoginReturnPath()).toBe("/share/abc?member=guest");
  });

  it("공유 링크가 아니면 복귀 경로를 남기지 않는다", async () => {
    sessionStorage.clear();
    await failQuery(new ApiError("AUTH_EXPIRED"));
    useErrorDialogStore.getState().closeErrorDialog();

    expect(consumeLoginReturnPath()).toBeNull();
  });

  it("AUTH_EXPIRED가 동시에 여러 건 나도 Dialog 확인 시 이동은 1회만 한다", async () => {
    await Promise.all([
      failQuery(new ApiError("AUTH_EXPIRED")),
      failQuery(new ApiError("AUTH_EXPIRED")),
    ]);
    useErrorDialogStore.getState().closeErrorDialog();
    useErrorDialogStore.getState().closeErrorDialog();

    expect(replace).toHaveBeenCalledTimes(1);
  });

  it("REISSUE_UNAVAILABLE는 Dialog만 띄우고 확인해도 이동하지 않는다", async () => {
    await failQuery(new ApiError("REISSUE_UNAVAILABLE"));
    useErrorDialogStore.getState().closeErrorDialog();

    expect(replace).not.toHaveBeenCalled();
    expect(clearLoggedInCookie).not.toHaveBeenCalled();
  });

  it.each(["AUTH_EXPIRED", "REISSUE_UNAVAILABLE"])(
    "%s는 기본 retry를 타지 않고 1회만 호출한다",
    async code => {
      const queryFn = vi.fn().mockRejectedValue(new ApiError(code));

      await queryClient.fetchQuery({ queryKey: [code], queryFn, retryDelay: 0 }).catch(() => {});

      expect(queryFn).toHaveBeenCalledTimes(1);
    },
  );
});
