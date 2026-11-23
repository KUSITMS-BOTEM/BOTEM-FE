import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { friendService } from "@/apis/friend/friendService";
import { useAddFriendMutation } from "@/hooks/mutations/friend/useAddFriendMutation";
import { friendsQueryKey } from "@/hooks/queries/friend/useFriendsQuery";
import { wishProfileQueryKey } from "@/hooks/queries/wish-profile/useWishProfileQuery";

vi.mock("@/apis/friend/friendService", () => ({
  friendService: { addFriend: vi.fn() },
}));

let queryClient: QueryClient;

const createWrapper = () =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

describe("useAddFriendMutation", () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    vi.mocked(friendService.addFriend).mockReset();
  });

  it("위시 프로필 키를 body에 담아 친구 맺기를 요청한다", async () => {
    vi.mocked(friendService.addFriend).mockResolvedValue(null);
    const { result } = renderHook(() => useAddFriendMutation(), { wrapper: createWrapper() });

    result.current.mutate("abc123");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(friendService.addFriend).toHaveBeenCalledWith({ wishProfileKey: "abc123" });
  });

  it("성공하면 친구 목록과 해당 위시 프로필 캐시를 무효화한다", async () => {
    vi.mocked(friendService.addFriend).mockResolvedValue(null);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useAddFriendMutation(), { wrapper: createWrapper() });

    result.current.mutate("abc123");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: friendsQueryKey });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: wishProfileQueryKey("abc123") });
  });

  it("실패하면 캐시를 무효화하지 않는다", async () => {
    vi.mocked(friendService.addFriend).mockRejectedValue(new Error("FRIEND_001"));
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useAddFriendMutation(), { wrapper: createWrapper() });

    result.current.mutate("abc123");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });
});
