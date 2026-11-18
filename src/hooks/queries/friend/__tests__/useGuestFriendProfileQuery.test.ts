import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { friendService } from "@/apis/friend/friendService";
import { useGuestFriendProfileQuery } from "@/hooks/queries/friend/useGuestFriendProfileQuery";
import type { GuestFriendProfileResponse } from "@/types/friend/friend";

vi.mock("@/apis/friend/friendService", () => ({
  friendService: {
    getGuestFriendProfile: vi.fn(),
  },
}));

const mockProfile: GuestFriendProfileResponse = {
  userId: 5,
  name: "지유",
  profileImageUrl: null,
  birthday: "10-24",
  birthdayDday: 3,
  fundings: [],
  wishCount: 2,
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

describe("useGuestFriendProfileQuery", () => {
  it("userId로 friendService.getGuestFriendProfile을 호출하고 응답을 돌려준다", async () => {
    vi.mocked(friendService.getGuestFriendProfile).mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useGuestFriendProfileQuery("5"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(friendService.getGuestFriendProfile).toHaveBeenCalledWith("5");
    expect(result.current.data).toEqual(mockProfile);
  });

  it("friendService.getGuestFriendProfile이 실패하면 isError가 true가 된다", async () => {
    vi.mocked(friendService.getGuestFriendProfile).mockRejectedValue(new Error("실패"));

    const { result } = renderHook(() => useGuestFriendProfileQuery("5"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
