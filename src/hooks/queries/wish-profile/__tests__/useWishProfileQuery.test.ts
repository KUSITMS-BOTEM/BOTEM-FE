import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { wishProfileService } from "@/apis/wish-profile/wishProfileService";
import { useWishProfileQuery } from "@/hooks/queries/wish-profile/useWishProfileQuery";
import type { FriendProfileResponse } from "@/types/friend/friend";

vi.mock("@/apis/wish-profile/wishProfileService", () => ({
  wishProfileService: {
    getWishProfile: vi.fn(),
  },
}));

const mockProfile: FriendProfileResponse = {
  userId: 5,
  name: "지유",
  profileImageUrl: null,
  birthday: "10-24",
  birthdayDday: 3,
  fundings: [],
  wishesVisible: false,
  wishCount: 2,
  wishes: [],
};

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useWishProfileQuery", () => {
  it("wishProfileKey로 wishProfileService.getWishProfile을 호출하고 응답을 돌려준다", async () => {
    vi.mocked(wishProfileService.getWishProfile).mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useWishProfileQuery("abc123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(wishProfileService.getWishProfile).toHaveBeenCalledWith("abc123");
    expect(result.current.data).toEqual(mockProfile);
  });

  it("wishProfileService.getWishProfile이 실패하면 isError가 true가 된다", async () => {
    vi.mocked(wishProfileService.getWishProfile).mockRejectedValue(new Error("실패"));

    const { result } = renderHook(() => useWishProfileQuery("abc123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
