import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { userService } from "@/apis/user/userService";
import { useCompleteOnboardingMutation } from "@/hooks/mutations/user/useCompleteOnboardingMutation";
import type { RegisterOnboardingRequest } from "@/types/user/onboarding";

vi.mock("@/apis/user/userService", () => ({
  userService: {
    completeOnboarding: vi.fn(),
  },
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
  birthday: "1999-01-01",
  bank: "KB_KOOKMIN",
  accountNumber: "123456789",
};

describe("useCompleteOnboardingMutation", () => {
  it("mutate 호출 시 userService.completeOnboarding이 올바른 body로 호출되고 성공 시 isSuccess가 true가 된다", async () => {
    vi.mocked(userService.completeOnboarding).mockResolvedValue(null);
    const { result } = renderHook(() => useCompleteOnboardingMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(userService.completeOnboarding).toHaveBeenCalledWith(body, expect.anything());
  });

  it("userService.completeOnboarding이 실패하면 mutation이 error 상태가 된다", async () => {
    const error = new Error("온보딩 완료 실패");
    vi.mocked(userService.completeOnboarding).mockRejectedValue(error);
    const { result } = renderHook(() => useCompleteOnboardingMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
