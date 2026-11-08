import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { userService } from "@/apis/user/userService";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import type { MyProfile } from "@/types/user/profile";

vi.mock("@/apis/user/userService", () => ({
  userService: {
    getMyProfile: vi.fn(),
  },
}));

const mockProfile: MyProfile = {
  nickname: "보탬이",
  profileImageUrl: "https://example.com/profile.png",
  birthday: "2000-01-01",
  wishProfileUrl: "https://example.com/wish",
  kakaoConnected: true,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe("useMyProfileQuery", () => {
  it("훅 호출 시 userService.getMyProfile이 호출된다", async () => {
    vi.mocked(userService.getMyProfile).mockResolvedValue(mockProfile);
    const { result } = renderHook(() => useMyProfileQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(userService.getMyProfile).toHaveBeenCalled();
  });

  it("조회 성공 시 data에 프로필이 그대로 반영된다", async () => {
    vi.mocked(userService.getMyProfile).mockResolvedValue(mockProfile);
    const { result } = renderHook(() => useMyProfileQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProfile);
  });

  it("userService.getMyProfile이 실패하면 isError가 true가 되고 error가 반영된다", async () => {
    const error = new Error("프로필 조회 실패");
    vi.mocked(userService.getMyProfile).mockRejectedValue(error);
    const { result } = renderHook(() => useMyProfileQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });
});
