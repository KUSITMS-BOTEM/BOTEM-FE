import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { authService } from "@/apis/auth/authService";
import { useKakaoLoginUriMutation } from "@/hooks/mutations/auth/useKakaoLoginUriMutation";

vi.mock("@/apis/auth/authService", () => ({
  authService: {
    getKakaoLoginUri: vi.fn(),
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

describe("useKakaoLoginUriMutation", () => {
  it("mutate 호출 시 authService.getKakaoLoginUri가 전달한 redirectUri로 호출되고 성공 시 응답 데이터를 받는다", async () => {
    const response = { loginUri: "https://kauth.kakao.com/oauth/authorize?..." };
    vi.mocked(authService.getKakaoLoginUri).mockResolvedValue(response);
    const { result } = renderHook(() => useKakaoLoginUriMutation(), { wrapper: createWrapper() });

    result.current.mutate("https://botem.app/auth/callback");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authService.getKakaoLoginUri).toHaveBeenCalledWith(
      "https://botem.app/auth/callback",
      expect.anything(),
    );
    expect(result.current.data).toEqual(response);
  });

  it("authService.getKakaoLoginUri가 실패하면 mutation이 error 상태가 된다", async () => {
    const error = new Error("로그인 URI 조회 실패");
    vi.mocked(authService.getKakaoLoginUri).mockRejectedValue(error);
    const { result } = renderHook(() => useKakaoLoginUriMutation(), { wrapper: createWrapper() });

    result.current.mutate("https://botem.app/auth/callback");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
