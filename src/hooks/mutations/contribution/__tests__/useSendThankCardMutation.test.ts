import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { contributionService } from "@/apis/contribution/contributionService";
import { useSendThankCardMutation } from "@/hooks/mutations/contribution/useSendThankCardMutation";
import { fundingManagementQueryKey } from "@/hooks/queries/funding/useFundingManagementQuery";
import { surpriseThankCardFriendsQueryKey } from "@/hooks/queries/funding/useSurpriseThankCardFriendsQuery";

vi.mock("@/apis/contribution/contributionService", () => ({
  contributionService: {
    sendThankCard: vi.fn(),
  },
}));

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return { wrapper, invalidateQueries };
};

const variables = {
  fundingId: 5,
  contributionId: 31,
  message: "고마워",
  paperColor: "PINK" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSendThankCardMutation", () => {
  it("mutate 호출 시 펀딩 id와 참여 id는 경로 인자로, 메시지와 편지지 색은 body로 나눠 서비스를 호출한다", async () => {
    vi.mocked(contributionService.sendThankCard).mockResolvedValue({} as never);
    const { wrapper } = setup();
    const { result } = renderHook(() => useSendThankCardMutation(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(contributionService.sendThankCard).toHaveBeenCalledWith(5, 31, {
      message: "고마워",
      paperColor: "PINK",
    });
  });

  it("성공하면 해당 펀딩의 관리 상세와 서프라이즈 고마운 친구 목록 쿼리를 무효화한다", async () => {
    vi.mocked(contributionService.sendThankCard).mockResolvedValue({} as never);
    const { wrapper, invalidateQueries } = setup();
    const { result } = renderHook(() => useSendThankCardMutation(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: fundingManagementQueryKey(5) });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: surpriseThankCardFriendsQueryKey(5),
    });
  });

  it("재조회가 모두 끝날 때까지 isPending을 유지한다", async () => {
    vi.mocked(contributionService.sendThankCard).mockResolvedValue({} as never);
    const { wrapper, invalidateQueries } = setup();
    const resolvers: (() => void)[] = [];
    const finishRefetch = () => resolvers.forEach(resolve => resolve());
    invalidateQueries.mockImplementation(
      () => new Promise<void>(resolve => resolvers.push(resolve)),
    );
    const { result } = renderHook(() => useSendThankCardMutation(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(invalidateQueries).toHaveBeenCalled());
    expect(result.current.isPending).toBe(true);

    finishRefetch();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("서비스가 실패하면 isError가 true가 되고 쿼리를 무효화하지 않는다", async () => {
    const error = new Error("감사 카드 전송 실패");
    vi.mocked(contributionService.sendThankCard).mockRejectedValue(error);
    const { wrapper, invalidateQueries } = setup();
    const { result } = renderHook(() => useSendThankCardMutation(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
