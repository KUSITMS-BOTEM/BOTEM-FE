import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { authService } from "@/apis/auth/authService";
import { useLogoutMutation } from "@/hooks/mutations/auth/useLogoutMutation";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";
import { consumeWishPromptPending, markWishPromptPending } from "@/utils/wish/wishPromptStorage";

vi.mock("@/apis/auth/authService", () => ({
  authService: {
    postLogout: vi.fn(),
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

describe("useLogoutMutation", () => {
  it("mutate 호출 시 authService.postLogout이 호출되고 성공 시 isSuccess가 true가 된다", async () => {
    vi.mocked(authService.postLogout).mockResolvedValue(null);
    const { result } = renderHook(() => useLogoutMutation(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authService.postLogout).toHaveBeenCalled();
  });

  it("authService.postLogout이 실패하면 mutation이 error 상태가 된다", async () => {
    const error = new Error("로그아웃 실패");
    vi.mocked(authService.postLogout).mockRejectedValue(error);
    const { result } = renderHook(() => useLogoutMutation(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });

  it("로그아웃 성공 시 accessToken과 프로필 캐시를 지운다", async () => {
    useAuthStore.getState().setAccessToken("access-token");
    vi.spyOn(queryClient, "removeQueries");
    vi.mocked(authService.postLogout).mockResolvedValue(null);
    const { result } = renderHook(() => useLogoutMutation(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: ["users", "me"] });
  });

  it("로그아웃 성공 시 다른 계정의 위시 시트 대기 플래그를 지운다", async () => {
    markWishPromptPending();
    vi.mocked(authService.postLogout).mockResolvedValue(null);
    const { result } = renderHook(() => useLogoutMutation(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(consumeWishPromptPending()).toBe(false);
  });
});
