import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { userService } from "@/apis/user/userService";
import { useWithdrawMutation } from "@/hooks/mutations/user/useWithdrawMutation";

vi.mock("@/apis/user/userService", () => ({
  userService: {
    withdraw: vi.fn(),
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

describe("useWithdrawMutation", () => {
  it("mutate 호출 시 userService.withdraw가 호출되고 성공 시 isSuccess가 true가 된다", async () => {
    vi.mocked(userService.withdraw).mockResolvedValue(null);
    const { result } = renderHook(() => useWithdrawMutation(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(userService.withdraw).toHaveBeenCalled();
  });

  it("userService.withdraw가 실패하면 mutation이 error 상태가 된다", async () => {
    const error = new Error("회원탈퇴 실패");
    vi.mocked(userService.withdraw).mockRejectedValue(error);
    const { result } = renderHook(() => useWithdrawMutation(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
