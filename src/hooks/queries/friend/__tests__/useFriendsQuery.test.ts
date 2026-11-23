import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { friendService } from "@/apis/friend/friendService";
import { friendsQueryKey, useFriendsQuery } from "@/hooks/queries/friend/useFriendsQuery";

vi.mock("@/apis/friend/friendService", () => ({
  friendService: { getFriends: vi.fn() },
}));

let queryClient: QueryClient;

const createWrapper = () =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

describe("useFriendsQuery", () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(friendService.getFriends).mockReset();
  });

  it("친구 목록을 조회해 반환한다", async () => {
    const list = { totalCount: 0, upcomingBirthdayFriends: [], friends: [] };
    vi.mocked(friendService.getFriends).mockResolvedValue(list);
    const { result } = renderHook(() => useFriendsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(list);
  });

  it("friendsQueryKey로 캐시에 저장돼 무효화 키와 같은 키를 쓴다", async () => {
    vi.mocked(friendService.getFriends).mockResolvedValue({
      totalCount: 0,
      upcomingBirthdayFriends: [],
      friends: [],
    });
    const { result } = renderHook(() => useFriendsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(friendsQueryKey)).toEqual(result.current.data);
  });

  it("enabled가 false면 서비스를 호출하지 않는다", () => {
    renderHook(() => useFriendsQuery(false), { wrapper: createWrapper() });

    expect(friendService.getFriends).not.toHaveBeenCalled();
  });

  it("조회가 실패하면 isError가 되고 전역 에러 안내를 건너뛰도록 표시한다", async () => {
    vi.mocked(friendService.getFriends).mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useFriendsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryCache().find({ queryKey: friendsQueryKey })?.meta).toEqual({
      skipGlobalError: true,
    });
  });
});
