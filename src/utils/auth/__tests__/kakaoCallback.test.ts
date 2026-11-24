import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { useErrorDialogStore } from "@/store/errorDialogStore";
import { handleKakaoCallback, redirectToLandingAfterFailure } from "@/utils/auth/kakaoCallback";
import { setKakaoOauthState } from "@/utils/auth/kakaoOauthState";
import { setLoginReturnPath } from "@/utils/auth/loginReturnPathStorage";

describe("redirectToLandingAfterFailure", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    useErrorDialogStore.getState().closeErrorDialog();
  });

  it("3초 뒤 로그인 실패 Dialog를 띄우고 랜딩으로 replace한다", () => {
    const replace = vi.fn();

    redirectToLandingAfterFailure({ replace } as never);

    expect(useErrorDialogStore.getState().message).toBeNull();
    expect(replace).not.toHaveBeenCalled();

    vi.advanceTimersByTime(3000);

    expect(useErrorDialogStore.getState().message).toBe(ERROR_MESSAGES.AUTH_004.message);
    expect(replace).toHaveBeenCalledWith("/");
  });
});

describe("handleKakaoCallback", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  const loginAs = (isNewUser: boolean) => {
    const replace = vi.fn();
    const mutate = vi.fn((_, options) => options.onSuccess({ accessToken: "token", isNewUser }));
    setKakaoOauthState("state-1");

    handleKakaoCallback("code", "state-1", mutate as never, { replace } as never);

    return replace;
  };

  it("기존 사용자는 로그인 전에 저장한 복귀 경로로 이동한다", () => {
    setLoginReturnPath("/friends/5");

    expect(loginAs(false)).toHaveBeenCalledWith("/friends/5");
  });

  it("기존 사용자는 복귀 경로가 없으면 /home으로 이동한다", () => {
    expect(loginAs(false)).toHaveBeenCalledWith("/home");
  });

  it("신규 사용자는 복귀 경로를 남겨둔 채 가입 화면으로 이동한다", () => {
    setLoginReturnPath("/friends/5");

    expect(loginAs(true)).toHaveBeenCalledWith("/auth/profile-check");
    expect(sessionStorage.getItem("loginReturnPath")).toBe("/friends/5");
  });

  describe("저장된 state가 없을 때 (인앱 브라우저 → 사파리 전환)", () => {
    const callbackWithoutStoredState = (state: string) => {
      const mutate = vi.fn();
      handleKakaoCallback("code", state, mutate, { replace: vi.fn() } as never);
      return mutate;
    };

    it("code를 교환하지 않고, state에 실린 공유 화면 경로를 복귀 경로로 되살린다", () => {
      const mutate = callbackWithoutStoredState("nonce./share/profile/abc");

      expect(mutate).not.toHaveBeenCalled();
      expect(sessionStorage.getItem("loginReturnPath")).toBe("/share/profile/abc");
    });

    it("공유 화면이 아닌 경로는 되살리지 않는다", () => {
      callbackWithoutStoredState("nonce./my/profile");

      expect(sessionStorage.getItem("loginReturnPath")).toBeNull();
    });

    it("경로가 없는 state면 복귀 경로를 남기지 않는다", () => {
      callbackWithoutStoredState("nonce");

      expect(sessionStorage.getItem("loginReturnPath")).toBeNull();
    });
  });
});
