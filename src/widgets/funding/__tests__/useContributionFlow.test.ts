import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { contributionService } from "@/apis/contribution/contributionService";
import { useFundingContributionStore } from "@/store/fundingContributionStore";
import { useGuestBotemStore } from "@/store/guestBotemStore";
import { ApiError } from "@/types/api";
import type { LetterWriteValues } from "@/widgets/letter-paper/LetterWriteSheet";
import { useContributionFlow } from "@/widgets/funding/useContributionFlow";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/apis/contribution/contributionService", () => ({
  contributionService: {
    createMessageContribution: vi.fn(),
    createContribution: vi.fn(),
    markTransferSent: vi.fn(),
  },
}));

let queryClient: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children);

const letter = {
  text: "축하해",
  name: "민지",
  color: "orange",
  paperStyle: "vividSolid",
} as LetterWriteValues;

const render = (isMember = false) =>
  renderHook(() => useContributionFlow({ shareKey: "share-key-5", isMember }), { wrapper });

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  useFundingContributionStore.getState().reset();
  useGuestBotemStore.getState().reset();
});

// 시작하면 입력값이 초기화되므로 편지는 시작한 뒤 작성한 것처럼 넣는다
const writeLetter = () => useFundingContributionStore.getState().setLetter(letter);

describe("useContributionFlow", () => {
  it("메시지 보태기를 제출하면 본인 확인 정보를 저장하고 완료 화면으로 이동한다", async () => {
    vi.mocked(contributionService.createMessageContribution).mockResolvedValue({} as never);
    const { result } = render();

    act(() => result.current.startMessage());
    writeLetter();
    act(() => result.current.submitContribution("1234"));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/share/share-key-5/complete"));
    expect(contributionService.createMessageContribution).toHaveBeenCalledWith(
      "share-key-5",
      expect.objectContaining({ guestPassword: "1234", message: "축하해" }),
    );
    expect(useGuestBotemStore.getState()).toMatchObject({
      shareKey: "share-key-5",
      name: "민지",
      password: "1234",
    });
    expect(result.current.isLetterOpen).toBe(true);
  });

  it("금액 보태기를 제출하면 응답 계좌로 송금 안내를 연다", async () => {
    vi.mocked(contributionService.createContribution).mockResolvedValue({
      contributionId: 98,
      payoutAccount: { bankName: "토스뱅크", accountNumber: "1000", accountHolder: null },
    } as never);
    const { result } = render();

    act(() => result.current.startContribute());
    writeLetter();
    act(() => result.current.submitContribution("1234"));

    await waitFor(() => expect(result.current.isMemberGuideOpen).toBe(true));
    expect(result.current.isContributeOpen).toBe(true);
    expect(result.current.submitted).toEqual({
      contributionId: 98,
      account: { bankName: "토스뱅크", accountNumber: "1000", accountHolder: "" },
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("응답에 계좌가 없으면 송금 안내를 열지 않는다", async () => {
    vi.mocked(contributionService.createContribution).mockResolvedValue(null as never);
    const { result } = render();

    act(() => result.current.startContribute());
    writeLetter();
    act(() => result.current.submitContribution("1234"));

    await waitFor(() => expect(contributionService.createContribution).toHaveBeenCalled());
    await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    expect(result.current.isMemberGuideOpen).toBe(false);
    expect(result.current.submitted).toBeNull();
  });

  it("편지가 없으면 제출하지 않는다", () => {
    useFundingContributionStore.getState().reset();
    const { result } = render();

    act(() => result.current.startMessage());
    act(() => result.current.submitContribution("1234"));

    expect(contributionService.createMessageContribution).not.toHaveBeenCalled();
  });

  it("이름이 겹쳐 실패(FUNDING_032)하면 비밀번호 시트만 닫는다", async () => {
    vi.mocked(contributionService.createMessageContribution).mockRejectedValue(
      new ApiError("FUNDING_032"),
    );
    const { result } = render();

    act(() => result.current.startMessage());
    writeLetter();
    act(() => result.current.setIsPasswordOpen(true));
    act(() => result.current.submitContribution("1234"));

    await waitFor(() => expect(result.current.isPasswordOpen).toBe(false));
    expect(result.current.isLetterOpen).toBe(true);
    expect(replace).not.toHaveBeenCalled();
  });

  it("비회원은 저장된 비밀번호로 송금 확인을 하고 완료 화면으로 이동한다", async () => {
    vi.mocked(contributionService.createContribution).mockResolvedValue({
      contributionId: 98,
      payoutAccount: { bankName: "토스뱅크", accountNumber: "1000", accountHolder: "김민재" },
    } as never);
    vi.mocked(contributionService.markTransferSent).mockResolvedValue({} as never);
    const { result } = render();

    act(() => result.current.startContribute());
    writeLetter();
    act(() => result.current.setPassword("1234"));
    act(() => result.current.submitContribution("1234"));
    await waitFor(() => expect(result.current.submitted).not.toBeNull());
    await act(() => result.current.completeTransfer());

    expect(contributionService.markTransferSent).toHaveBeenCalledWith("share-key-5", 98, {
      guestPassword: "1234",
    });
    expect(replace).toHaveBeenCalledWith("/share/share-key-5/complete");
  });

  it("회원은 비밀번호 없이 송금 확인을 한다", async () => {
    vi.mocked(contributionService.createContribution).mockResolvedValue({
      contributionId: 98,
      payoutAccount: { bankName: "토스뱅크", accountNumber: "1000", accountHolder: "김민재" },
    } as never);
    vi.mocked(contributionService.markTransferSent).mockResolvedValue({} as never);
    const { result } = render(true);

    act(() => result.current.startContribute());
    writeLetter();
    act(() => result.current.submitContribution());
    await waitFor(() => expect(result.current.submitted).not.toBeNull());
    await act(() => result.current.completeTransfer());

    expect(contributionService.markTransferSent).toHaveBeenCalledWith("share-key-5", 98, {
      guestPassword: null,
    });
  });

  it("보태기를 그만두면 열린 시트를 모두 닫고 입력값을 비우며 flowKey를 올린다", () => {
    const { result } = render();
    act(() => result.current.startContribute());
    act(() => result.current.setIsLetterOpen(true));
    act(() => result.current.setIsPasswordOpen(true));
    act(() => result.current.requestExit());
    expect(result.current.isExitOpen).toBe(true);
    const before = result.current.flowKey;

    act(() => result.current.handleExitConfirm());

    expect(result.current).toMatchObject({
      isExitOpen: false,
      isContributeOpen: false,
      isLetterOpen: false,
      isPasswordOpen: false,
      isMemberGuideOpen: false,
      flowKey: before + 1,
    });
    expect(useFundingContributionStore.getState().letter).toBeNull();
  });
});
