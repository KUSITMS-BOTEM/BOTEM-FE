import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { userService } from "@/apis/user/userService";
import { useCompleteOnboardingMutation } from "@/hooks/mutations/user/useCompleteOnboardingMutation";
import { setSignupFlow } from "@/utils/signupFlowStorage";
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

  it("성공 시 signupFlow를 비우고 /main으로 이동한다 (호출 화면이 언마운트돼도 실행돼야 함)", async () => {
    vi.mocked(userService.completeOnboarding).mockResolvedValue(null);
    setSignupFlow({ step: "accountEntry" });
    const { result } = renderHook(() => useCompleteOnboardingMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(userService.completeOnboarding).toHaveBeenCalledWith(body, expect.anything());
    expect(sessionStorage.getItem("signupFlow")).toBeNull();
    expect(replace).toHaveBeenCalledWith("/main");
  });

  it("userService.completeOnboarding이 실패하면 mutation이 error 상태가 되고 /로 이동한다", async () => {
    const error = new Error("온보딩 완료 실패");
    vi.mocked(userService.completeOnboarding).mockRejectedValue(error);
    const { result } = renderHook(() => useCompleteOnboardingMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(replace).toHaveBeenCalledWith("/");
  });
});
