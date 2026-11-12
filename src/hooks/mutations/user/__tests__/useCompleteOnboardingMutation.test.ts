import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { userService } from "@/apis/user/userService";
import { useCompleteOnboardingMutation } from "@/hooks/mutations/user/useCompleteOnboardingMutation";
import { DEFAULT_ERROR_MESSAGE, ERROR_MESSAGES } from "@/constants/errorMessages";
import { ApiError } from "@/types/api";
import { useErrorDialogStore } from "@/store/errorDialogStore";
import { setSignupFlow } from "@/utils/auth/signupFlowStorage";
import { consumeWishPromptPending } from "@/utils/wish/wishPromptStorage";
import type { RegisterOnboardingRequest } from "@/types/user/onboarding";

vi.mock("@/apis/user/userService", () => ({
  userService: {
    completeOnboarding: vi.fn(),
  },
}));

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

const body: RegisterOnboardingRequest = {
  name: "홍길동",
  birthday: "01-01",
  bank: "KB_KOOKMIN",
  accountNumber: "123456789",
};

describe("useCompleteOnboardingMutation", () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it("성공 시 signupFlow를 비우고 위시 프롬프트 플래그를 세운 뒤 /home으로 이동한다 (호출 화면이 언마운트돼도 실행돼야 함)", async () => {
    vi.mocked(userService.completeOnboarding).mockResolvedValue(null);
    setSignupFlow({ step: "accountEntry" });
    const { result } = renderHook(() => useCompleteOnboardingMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(userService.completeOnboarding).toHaveBeenCalledWith(body, expect.anything());
    expect(sessionStorage.getItem("signupFlow")).toBeNull();
    expect(consumeWishPromptPending()).toBe(true);
    expect(replace).toHaveBeenCalledWith("/home");
  });

  it("userService.completeOnboarding이 실패하면 에러 Dialog를 띄우고, 확인을 누른 뒤에야 /로 이동한다", async () => {
    const error = new Error("온보딩 완료 실패");
    vi.mocked(userService.completeOnboarding).mockRejectedValue(error);
    const { result } = renderHook(() => useCompleteOnboardingMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(useErrorDialogStore.getState().message).toBe(DEFAULT_ERROR_MESSAGE.message);
    expect(replace).not.toHaveBeenCalled();

    useErrorDialogStore.getState().closeErrorDialog();

    expect(replace).toHaveBeenCalledWith("/");
  });

  it("action이 inline인 에러(PAYOUT_ACCOUNT_004)도 Dialog로 안내한 뒤 /로 이동한다", async () => {
    vi.mocked(userService.completeOnboarding).mockRejectedValue(
      new ApiError("PAYOUT_ACCOUNT_004", "계좌번호 형식 오류"),
    );
    const { result } = renderHook(() => useCompleteOnboardingMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useErrorDialogStore.getState().message).toBe(ERROR_MESSAGES.PAYOUT_ACCOUNT_004.message);
    expect(replace).not.toHaveBeenCalled();

    useErrorDialogStore.getState().closeErrorDialog();

    expect(replace).toHaveBeenCalledWith("/");
  });
});
