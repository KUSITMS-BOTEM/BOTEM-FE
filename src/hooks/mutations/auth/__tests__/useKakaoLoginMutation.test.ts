import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { authService } from "@/apis/auth/authService";
import { useKakaoLoginMutation } from "@/hooks/mutations/auth/useKakaoLoginMutation";

vi.mock("@/apis/auth/authService", () => ({
  authService: {
    postKakaoLogin: vi.fn(),
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

describe("useKakaoLoginMutation", () => {
  it("mutate 호출 시 authService.postKakaoLogin이 전달한 인자로 호출되고 성공 시 응답 데이터를 받는다", async () => {
    const response = { accessToken: "access-token" };
    vi.mocked(authService.postKakaoLogin).mockResolvedValue(response);
    const { result } = renderHook(() => useKakaoLoginMutation(), { wrapper: createWrapper() });

    result.current.mutate({ code: "kakao-code", redirectUri: "https://botem.app/auth/kakao" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authService.postKakaoLogin).toHaveBeenCalledWith(
      { code: "kakao-code", redirectUri: "https://botem.app/auth/kakao" },
      expect.anything(),
    );
    expect(result.current.data).toEqual(response);
  });

  it("authService.postKakaoLogin이 실패하면 mutation이 error 상태가 된다", async () => {
    const error = new Error("카카오 로그인 실패");
    vi.mocked(authService.postKakaoLogin).mockRejectedValue(error);
    const { result } = renderHook(() => useKakaoLoginMutation(), { wrapper: createWrapper() });

    result.current.mutate({ code: "kakao-code", redirectUri: "https://botem.app/auth/kakao" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
