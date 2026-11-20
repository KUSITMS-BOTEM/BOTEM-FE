import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { contributionService } from "@/apis/contribution/contributionService";
import { useGuestBotemStore } from "@/store/guestBotemStore";
import type { FundingDetailParticipant } from "@/types/funding/fundingDetail";
import { useMyBotem } from "@/widgets/funding/useMyBotem";

vi.mock("@/apis/contribution/contributionService", () => ({
  contributionService: { accessGuestContribution: vi.fn(), getMyContributions: vi.fn() },
}));

let queryClient: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children);

const participants = [
  { order: 1, name: "서연", profileImageUrl: null, contributedDate: "2026-11-10" },
  { order: 2, name: "민지", profileImageUrl: null, contributedDate: "2026-11-11" },
] as FundingDetailParticipant[];

const render = (overrides: Partial<Parameters<typeof useMyBotem>[0]> = {}) =>
  renderHook(
    () =>
      useMyBotem({
        shareKey: "share-key-5",
        isGuest: true,
        isMember: false,
        participants,
        ...overrides,
      }),
    { wrapper },
  );

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  useGuestBotemStore.getState().reset();
});

describe("useMyBotem 비회원 본인 확인", () => {
  it("보태기를 마치고 돌아온 비회원은 저장된 이름·비밀번호로 한 번 확인해 송금 대기 중인 내 보탬을 미확인으로 보여준다", async () => {
    useGuestBotemStore.getState().setIdentity("share-key-5", "민지", "1234");
    vi.mocked(contributionService.accessGuestContribution).mockResolvedValue({
      status: "PENDING_CONFIRMATION",
    } as never);

    const { result } = render();

    await waitFor(() => expect(result.current.myUnconfirmedCount).toBe(1));
    expect(contributionService.accessGuestContribution).toHaveBeenCalledTimes(1);
    expect(contributionService.accessGuestContribution).toHaveBeenCalledWith("share-key-5", {
      participantName: "민지",
      guestPassword: "1234",
    });
    expect(result.current.myBotemFriends[0]).toMatchObject({ name: "민지", isConfirmed: false });
  });

  it("자동 확인이 실패해도 에러 알림을 남기지 않고 다시 요청하지도 않는다", async () => {
    useGuestBotemStore.getState().setIdentity("share-key-5", "민지", "1234");
    vi.mocked(contributionService.accessGuestContribution).mockRejectedValue(new Error("실패"));

    const { result, rerender } = render();

    await waitFor(() =>
      expect(contributionService.accessGuestContribution).toHaveBeenCalledTimes(1),
    );
    await waitFor(() => expect(result.current.accessGuest.isError).toBe(false));
    expect(result.current.guestFindError).toBeUndefined();
    act(() => rerender());
    expect(contributionService.accessGuestContribution).toHaveBeenCalledTimes(1);
  });

  it("이 펀딩에서 본인 확인을 한 적 없으면 요청하지 않는다", () => {
    useGuestBotemStore.getState().setIdentity("other-share-key", "민지", "1234");

    render();

    expect(contributionService.accessGuestContribution).not.toHaveBeenCalled();
  });

  it("회원은 비밀번호 확인 대신 내 보탬 조회를 쓴다", async () => {
    useGuestBotemStore.getState().setIdentity("share-key-5", "민지", "");
    vi.mocked(contributionService.getMyContributions).mockResolvedValue({
      editable: true,
      contributions: [{ contributionId: 1, participantName: "민지", status: "REJECTED" }],
    } as never);

    const { result } = render({ isMember: true });

    await waitFor(() => expect(result.current.myUnconfirmedCount).toBe(1));
    expect(contributionService.accessGuestContribution).not.toHaveBeenCalled();
  });
});
