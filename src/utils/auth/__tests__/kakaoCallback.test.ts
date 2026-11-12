import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { useErrorDialogStore } from "@/store/errorDialogStore";
import { redirectToLandingAfterFailure } from "@/utils/auth/kakaoCallback";

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
