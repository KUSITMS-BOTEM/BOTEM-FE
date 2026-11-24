import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useCompleteSurpriseGiftPreparationMutation } from "@/hooks/mutations/funding/useCompleteSurpriseGiftPreparationMutation";
import { useSurpriseGiftPreparationQuery } from "@/hooks/queries/funding/useSurpriseGiftPreparationQuery";
import type { SurpriseGiftPreparationResponse } from "@/types/funding/surprise";
import { openPendingTab } from "@/utils/openPendingTab";
import SurpriseGiftContainer from "@/widgets/funding/SurpriseGiftContainer";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));
vi.mock("@/hooks/queries/funding/useSurpriseGiftPreparationQuery", () => ({
  useSurpriseGiftPreparationQuery: vi.fn(),
}));
vi.mock("@/hooks/mutations/funding/useCompleteSurpriseGiftPreparationMutation", () => ({
  useCompleteSurpriseGiftPreparationMutation: vi.fn(),
}));
vi.mock("@/utils/openPendingTab", () => ({ openPendingTab: vi.fn() }));
vi.mock("@/components/ToastMessage", () => ({
  default: ({ show, text }: { show: boolean; text: string }) => (
    <div data-testid="toast" data-show={String(show)}>
      {text}
    </div>
  ),
}));
vi.mock("@/widgets/funding/skeleton/SurpriseGiftViewSkeleton", () => ({
  default: () => <div data-testid="skeleton" aria-busy />,
}));
vi.mock("@/widgets/funding/DepositConfirmSheet", () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div role="dialog" aria-label="입금 확인">
        <button onClick={onClose}>입금 확인 닫기</button>
      </div>
    ) : null,
}));
vi.mock("@/widgets/funding/SurpriseReadySheet", () => ({
  default: ({
    open,
    recipientName,
    revealDateLabel,
    progress,
    startDate,
    endDate,
    onClose,
  }: {
    open: boolean;
    recipientName: string;
    revealDateLabel?: string;
    progress: number;
    startDate: string;
    endDate: string;
    onClose: () => void;
  }) =>
    open ? (
      <div role="dialog" aria-label="선물 준비 완료">
        <span>{`${recipientName}/${revealDateLabel}/${progress}/${startDate}~${endDate}`}</span>
        <button onClick={onClose}>완료 시트 닫기</button>
      </div>
    ) : null,
}));
vi.mock("@/widgets/funding/FundingTransferGuideSheet", () => ({
  default: ({
    open,
    sheetTitle,
    description,
    amount,
    account,
    onComplete,
  }: {
    open: boolean;
    sheetTitle: string;
    description: string;
    amount: number;
    account: { accountHolder: string; accountNumber: string };
    onComplete: () => void | Promise<unknown>;
  }) =>
    open ? (
      <div role="dialog" aria-label="송금 안내">
        <span>{sheetTitle}</span>
        <span>{amount}</span>
        <span>{`${account.accountHolder}/${account.accountNumber}`}</span>
        <span>{description}</span>
        <button onClick={() => void Promise.resolve(onComplete()).catch(() => {})}>
          송금 완료
        </button>
      </div>
    ) : null,
}));

const makePreparation = (
  overrides: Partial<SurpriseGiftPreparationResponse> = {},
): SurpriseGiftPreparationResponse => ({
  fundingId: 9,
  shareKey: "share-key",
  recipientName: "지유",
  recipientWithdrawn: false,
  recipientPayoutAccount: null,
  productName: "무선 헤드폰",
  productImageUrl: "https://example.com/gift.png",
  productUrl: "https://coupang.com/gift",
  productSellerName: "보탬샵",
  targetAmount: 300000,
  confirmedAmount: 300000,
  achievementPercentage: 100,
  targetReached: true,
  participantCount: 4,
  messageCount: 4,
  pendingContributionCount: 0,
  pendingCleanupRequired: false,
  fundingStartedAt: "2026-09-01T00:00:00",
  deadline: "2026-10-12T00:00:00",
  earlyClosedAt: null,
  revealAt: "2026-10-13T00:00:00",
  giftPreparedAt: null,
  ...overrides,
});

const account = {
  bank: "KB",
  bankName: "국민은행",
  accountNumber: "123-456",
  accountHolder: "김지유" as string | null,
} as unknown as NonNullable<SurpriseGiftPreparationResponse["recipientPayoutAccount"]>;

const refetch = vi.fn();
const mutateAsync = vi.fn();
const tab = { navigate: vi.fn(), close: vi.fn() };

const mockQuery = (state: {
  data?: SurpriseGiftPreparationResponse;
  isError?: boolean;
  isSuccess?: boolean;
}) => {
  vi.mocked(useSurpriseGiftPreparationQuery).mockReturnValue({
    data: state.data,
    isError: state.isError ?? false,
    isSuccess: state.isSuccess ?? !!state.data,
    refetch,
  } as unknown as ReturnType<typeof useSurpriseGiftPreparationQuery>);
};

const renderContainer = (data: Partial<SurpriseGiftPreparationResponse> = {}) => {
  mockQuery({ data: makePreparation(data) });
  return render(<SurpriseGiftContainer fundingId="9" />);
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useCompleteSurpriseGiftPreparationMutation).mockReturnValue({
    mutateAsync,
  } as unknown as ReturnType<typeof useCompleteSurpriseGiftPreparationMutation>);
  vi.mocked(openPendingTab).mockReturnValue(tab as unknown as ReturnType<typeof openPendingTab>);
  mutateAsync.mockResolvedValue(makePreparation({ giftPreparedAt: "2026-10-12T10:00:00" }));
});

describe("SurpriseGiftContainer 로딩·에러", () => {
  it("조회 중이면 스켈레톤을 보이고 선물 준비 화면은 없다", () => {
    mockQuery({ isSuccess: false });
    render(<SurpriseGiftContainer fundingId="9" />);

    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "쿠팡에 선물 사러가기" })).not.toBeInTheDocument();
  });

  it("조회에 실패하면 에러 화면에서 다시 시도로 재조회한다", async () => {
    mockQuery({ isError: true });
    render(<SurpriseGiftContainer fundingId="9" />);

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("에러 화면에서 닫기를 누르면 홈으로 이동한다", async () => {
    mockQuery({ isError: true });
    render(<SurpriseGiftContainer fundingId="9" />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(replace).toHaveBeenCalledWith("/home");
  });
});

describe("SurpriseGiftContainer 확인 대기 정리", () => {
  it("pendingCleanupRequired이면 들어오자마자 입금 확인 시트를 연다", () => {
    renderContainer({ pendingCleanupRequired: true });

    expect(screen.getByRole("dialog", { name: "입금 확인" })).toBeInTheDocument();
  });

  it("pendingCleanupRequired가 아니면 입금 확인 시트를 열지 않는다", () => {
    renderContainer({ pendingCleanupRequired: false });

    expect(screen.queryByRole("dialog", { name: "입금 확인" })).not.toBeInTheDocument();
  });

  it("확인 대기가 남은 채 선물 준비하기를 누르면 요청 없이 입금 확인 시트를 다시 연다", async () => {
    renderContainer({ pendingCleanupRequired: true });
    await userEvent.click(screen.getByRole("button", { name: "입금 확인 닫기" }));
    expect(screen.queryByRole("dialog", { name: "입금 확인" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "선물 준비하기" }));

    expect(screen.getByRole("dialog", { name: "입금 확인" })).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("입금 확인 시트를 닫으면 준비 정보를 다시 조회한다", async () => {
    renderContainer({ pendingCleanupRequired: true });

    await userEvent.click(screen.getByRole("button", { name: "입금 확인 닫기" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

describe("SurpriseGiftContainer 쿠팡 구매", () => {
  it("선물 준비를 완료하지 않고 상품 URL만 연다", async () => {
    renderContainer({ productUrl: "https://coupang.com/gift" });

    await userEvent.click(screen.getByRole("button", { name: "쿠팡에 선물 사러가기" }));

    expect(tab.navigate).toHaveBeenCalledWith("https://coupang.com/gift");
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog", { name: "선물 준비 완료" })).not.toBeInTheDocument();
  });

  it("확인 대기가 남아 있어도 상품 URL은 연다", async () => {
    renderContainer({ pendingCleanupRequired: true, productUrl: "https://coupang.com/gift" });
    await userEvent.click(screen.getByRole("button", { name: "입금 확인 닫기" }));

    await userEvent.click(screen.getByRole("button", { name: "쿠팡에 선물 사러가기" }));

    expect(tab.navigate).toHaveBeenCalledWith("https://coupang.com/gift");
  });
});

describe("SurpriseGiftContainer 선물 준비하기", () => {
  it("선물 준비를 완료한 뒤 선물 준비 완료 시트를 연다", async () => {
    renderContainer();

    await userEvent.click(screen.getByRole("button", { name: "선물 준비하기" }));

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("dialog", { name: "선물 준비 완료" })).toBeInTheDocument();
  });

  it("시트에 받는 사람·공개 시각·달성률·펀딩 기간을 넘긴다", async () => {
    renderContainer({
      achievementPercentage: 92,
      fundingStartedAt: "2026-09-01T00:00:00",
      deadline: "2026-10-12T23:59:59",
    });

    await userEvent.click(screen.getByRole("button", { name: "선물 준비하기" }));

    expect(
      await screen.findByText("지유/10월 13일 0시/92/2026-09-01~2026-10-12"),
    ).toBeInTheDocument();
  });

  it("받는 사람 이름이 없으면 시트에 '친구'로 넘긴다", async () => {
    renderContainer({ recipientName: null, giftPreparedAt: "2026-10-12T10:00:00" });

    await userEvent.click(screen.getByRole("button", { name: "선물 준비하기" }));

    expect(await screen.findByText(/^친구\//)).toBeInTheDocument();
  });

  it("이미 선물 준비를 마쳤으면 API를 다시 호출하지 않고 시트를 연다", async () => {
    renderContainer({ giftPreparedAt: "2026-10-12T10:00:00" });

    await userEvent.click(screen.getByRole("button", { name: "선물 준비하기" }));

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(await screen.findByRole("dialog", { name: "선물 준비 완료" })).toBeInTheDocument();
  });

  it("선물 준비 완료가 실패하면 시트를 열지 않는다", async () => {
    mutateAsync.mockRejectedValue(new Error("fail"));
    renderContainer();

    await userEvent.click(screen.getByRole("button", { name: "선물 준비하기" }));

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog", { name: "선물 준비 완료" })).not.toBeInTheDocument();
  });

  it("연타해도 선물 준비 완료 요청은 한 번만 보낸다", async () => {
    renderContainer();
    const button = screen.getByRole("button", { name: "선물 준비하기" });

    fireEvent.click(button);
    fireEvent.click(button);
    await screen.findByRole("dialog", { name: "선물 준비 완료" });

    expect(mutateAsync).toHaveBeenCalledTimes(1);
  });

  it("선물 준비 완료 시트를 닫으면 홈으로 이동한다", async () => {
    renderContainer({ giftPreparedAt: "2026-10-12T10:00:00" });
    await userEvent.click(screen.getByRole("button", { name: "선물 준비하기" }));

    await userEvent.click(await screen.findByRole("button", { name: "완료 시트 닫기" }));

    expect(replace).toHaveBeenCalledWith("/home");
  });
});

describe("SurpriseGiftContainer 송금", () => {
  it("계좌가 없고 탈퇴한 친구면 탈퇴 안내 토스트를 띄우고 요청하지 않는다", async () => {
    renderContainer({
      targetReached: false,
      recipientPayoutAccount: null,
      recipientWithdrawn: true,
    });

    await userEvent.click(screen.getByRole("button", { name: "지유에게 송금하기" }));

    expect(screen.getByTestId("toast")).toHaveTextContent("탈퇴한 친구라 송금할 수 없어요");
    expect(screen.getByTestId("toast")).toHaveAttribute("data-show", "true");
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("계좌가 없고 탈퇴하지 않았으면 계좌 미등록 토스트를 띄운다", async () => {
    renderContainer({
      targetReached: false,
      recipientPayoutAccount: null,
      recipientWithdrawn: false,
    });

    await userEvent.click(screen.getByRole("button", { name: "지유에게 송금하기" }));

    expect(screen.getByTestId("toast")).toHaveTextContent("친구가 아직 계좌를 등록하지 않았어요");
  });

  it("토스트는 2초 뒤에 사라진다", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      renderContainer({ targetReached: false, recipientPayoutAccount: null });
      fireEvent.click(screen.getByRole("button", { name: "지유에게 송금하기" }));
      expect(screen.getByTestId("toast")).toHaveAttribute("data-show", "true");

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByTestId("toast")).toHaveAttribute("data-show", "false");
    } finally {
      vi.useRealTimers();
    }
  });

  it("계좌가 있으면 선물 준비를 완료하지 않고 송금 안내 시트만 연다", async () => {
    renderContainer({
      targetReached: false,
      recipientPayoutAccount: account,
      confirmedAmount: 120000,
    });

    await userEvent.click(screen.getByRole("button", { name: "지유에게 송금하기" }));

    const sheet = await screen.findByRole("dialog", { name: "송금 안내" });
    expect(sheet).toHaveTextContent("송금하기");
    expect(sheet).toHaveTextContent("120000");
    expect(sheet).toHaveTextContent("송금한 뒤 돌아와서");
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("예금주가 null이면 받는 사람 이름을 예금주로 대신 넘긴다", async () => {
    renderContainer({
      targetReached: false,
      recipientPayoutAccount: { ...account, accountHolder: null },
    });

    await userEvent.click(screen.getByRole("button", { name: "지유에게 송금하기" }));

    expect(await screen.findByText("지유/123-456")).toBeInTheDocument();
  });

  it("송금 안내 시트에서 완료하면 선물 준비를 완료하고 선물 준비 완료 시트로 바꾼다", async () => {
    renderContainer({ targetReached: false, recipientPayoutAccount: account });
    await userEvent.click(screen.getByRole("button", { name: "지유에게 송금하기" }));

    await userEvent.click(await screen.findByRole("button", { name: "송금 완료" }));

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("dialog", { name: "선물 준비 완료" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "송금 안내" })).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("선물 준비 완료가 실패하면 송금 안내 시트를 그대로 둔다", async () => {
    mutateAsync.mockRejectedValue(new Error("fail"));
    renderContainer({ targetReached: false, recipientPayoutAccount: account });
    await userEvent.click(screen.getByRole("button", { name: "지유에게 송금하기" }));

    await userEvent.click(await screen.findByRole("button", { name: "송금 완료" }));

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog", { name: "송금 안내" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "선물 준비 완료" })).not.toBeInTheDocument();
  });

  it("이미 선물 준비를 마쳤으면 다시 요청하지 않고 선물 준비 완료 시트를 연다", async () => {
    renderContainer({
      targetReached: false,
      recipientPayoutAccount: account,
      giftPreparedAt: "2026-10-12T10:00:00",
    });
    await userEvent.click(screen.getByRole("button", { name: "지유에게 송금하기" }));

    await userEvent.click(await screen.findByRole("button", { name: "송금 완료" }));

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(await screen.findByRole("dialog", { name: "선물 준비 완료" })).toBeInTheDocument();
  });

  it("확인 대기가 남아 있으면 송금 안내 시트 대신 입금 확인 시트를 연다", async () => {
    renderContainer({
      targetReached: false,
      recipientPayoutAccount: account,
      pendingCleanupRequired: true,
    });
    await userEvent.click(await screen.findByRole("button", { name: "입금 확인 닫기" }));

    await userEvent.click(screen.getByRole("button", { name: "지유에게 송금하기" }));

    expect(screen.getByRole("dialog", { name: "입금 확인" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "송금 안내" })).not.toBeInTheDocument();
  });
});

describe("SurpriseGiftContainer 닫기", () => {
  it("닫기를 누르면 홈으로 이동한다", async () => {
    renderContainer();

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(replace).toHaveBeenCalledWith("/home");
  });
});
