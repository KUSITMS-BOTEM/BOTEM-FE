import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useCloseFundingMutation } from "@/hooks/mutations/funding/useCloseFundingMutation";
import { useOpenFundingResultMutation } from "@/hooks/mutations/funding/useOpenFundingResultMutation";
import { useFundingResultQuery } from "@/hooks/queries/funding/useFundingResultQuery";
import { useFundingCloseToastStore } from "@/store/fundingCloseToastStore";
import type { FundingResultResponse } from "@/types/funding/fundingResult";
import FundingRevealContainer from "@/widgets/funding/FundingRevealContainer";

vi.mock("@/hooks/queries/funding/useFundingResultQuery", () => ({
  useFundingResultQuery: vi.fn(),
}));
vi.mock("@/hooks/mutations/funding/useCloseFundingMutation", () => ({
  useCloseFundingMutation: vi.fn(),
}));
vi.mock("@/hooks/mutations/funding/useOpenFundingResultMutation", () => ({
  useOpenFundingResultMutation: vi.fn(),
}));
vi.mock("@/components/effects/RevealMotion", () => ({
  default: ({ names }: { names: string[] }) => (
    <div data-testid="reveal-motion">{names.length}</div>
  ),
}));
vi.mock("@/components/effects/EmptyIllustration", () => ({
  default: () => <div data-testid="empty-illustration" />,
}));
vi.mock("@/widgets/funding/FundingExtendFlow", () => ({
  default: ({
    open,
    fundingId,
    collectedAmount,
  }: {
    open: boolean;
    fundingId: number;
    collectedAmount: number;
  }) =>
    open ? (
      <div
        data-testid="extend-flow"
        data-funding-id={fundingId}
        data-collected-amount={collectedAmount}
      />
    ) : null,
}));
vi.mock("@/widgets/rolling-paper/RollingPaperContainer", () => ({
  default: ({
    open,
    fundingId,
    onClose,
  }: {
    open: boolean;
    fundingId: number;
    onClose: () => void;
  }) =>
    open ? (
      <div data-testid="rolling-paper" data-funding-id={fundingId}>
        <button onClick={onClose}>시트 닫기</button>
      </div>
    ) : null,
}));

const replace = vi.fn();
const push = vi.fn();
let search = "";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
  useParams: () => ({ fundingId: "12" }),
  useSearchParams: () => new URLSearchParams(search),
}));

const refetch = vi.fn();
const mutate = vi.fn();
const closeFunding = vi.fn();

const mockQuery = (value: { data?: FundingResultResponse; isLoading?: boolean }) => {
  vi.mocked(useFundingResultQuery).mockReturnValue({
    data: undefined,
    isLoading: false,
    refetch,
    ...value,
  } as unknown as ReturnType<typeof useFundingResultQuery>);
};

const mockMutation = (value: { isPending?: boolean } = {}) => {
  vi.mocked(useOpenFundingResultMutation).mockReturnValue({
    mutate,
    isPending: false,
    ...value,
  } as unknown as ReturnType<typeof useOpenFundingResultMutation>);
};

const makeResult = (
  count: number,
  achievementPercentage: number,
  confirmedAmount: number,
  overrides: Partial<FundingResultResponse> = {},
): FundingResultResponse => ({
  fundingId: 12,
  productName: "소니 WH-1000XM5",
  productImageUrl: "https://image.example.com/product.jpg",
  targetAmount: 364000,
  confirmedAmount,
  achievementPercentage,
  targetReached: achievementPercentage >= 100,
  participantCount: count,
  messageCount: count,
  pendingContributionCount: 0,
  pendingCleanupRequired: false,
  resultOpenedAt: null,
  contributions: Array.from({ length: count }, (_, i) => ({
    contributionId: i + 1,
    name: `친구${i + 1}`,
    profileImageUrl: null,
    status: "CONFIRMED" as const,
    participatedAt: "2026-11-10T14:20:00",
    hasMessage: true,
    hasPhoto: false,
    hasVoice: false,
    thankCardSent: false,
  })),
  ...overrides,
});

// mutate의 onSuccess를 바로 호출해 팡 열기 성공을 흉내 낸다
const resolveOpenWith = (opened: FundingResultResponse) => {
  mutate.mockImplementation(
    (_id: number, options: { onSuccess: (data: FundingResultResponse) => void }) =>
      options.onSuccess(opened),
  );
};

beforeEach(() => {
  useFundingCloseToastStore.setState({ pending: false });
  vi.clearAllMocks();
  search = "";
  window.history.replaceState(null, "", "/");
  mockMutation();
  vi.mocked(useCloseFundingMutation).mockReturnValue({
    mutate: closeFunding,
    isPending: false,
  } as unknown as ReturnType<typeof useCloseFundingMutation>);
});

describe("FundingRevealContainer", () => {
  it("useParams의 fundingId를 숫자로 바꿔 쿼리를 호출한다", () => {
    mockQuery({ isLoading: true });

    render(<FundingRevealContainer />);

    expect(useFundingResultQuery).toHaveBeenCalledWith(12);
  });

  it("로딩 중이면 로딩 안내만 보여주고 결과·에러·빈 화면 본문을 렌더하지 않는다", () => {
    mockQuery({ isLoading: true });

    render(<FundingRevealContainer />);

    expect(screen.getByRole("status")).toHaveTextContent("펀딩 결과를 불러오는 중이에요");
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("데이터가 없으면 에러 문구와 '다시 시도' 버튼을 보여준다", () => {
    mockQuery({});

    render(<FundingRevealContainer />);

    expect(screen.getByText("펀딩 결과를 불러오지 못했어요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });

  it("'다시 시도'를 누르면 refetch를 호출한다", async () => {
    mockQuery({});
    render(<FundingRevealContainer />);

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("참여자가 0명이면 빈 화면을 보여주고 결과 문구는 보여주지 않는다", () => {
    mockQuery({ data: makeResult(0, 0, 0) });

    render(<FundingRevealContainer />);

    expect(screen.getByRole("heading", { name: "이번엔 조용히 지나갔어요" })).toBeInTheDocument();
    expect(screen.queryByTestId("reveal-motion")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "메시지 열어보기" })).not.toBeInTheDocument();
  });

  it("빈 화면에서 '기간 연장하러 가기'를 누르면 모인 금액과 함께 기간 연장 시트를 연다", async () => {
    mockQuery({ data: makeResult(0, 0, 0) });

    render(<FundingRevealContainer />);
    expect(screen.queryByTestId("extend-flow")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "기간 연장하러 가기" }));

    const flow = screen.getByTestId("extend-flow");
    expect(flow).toHaveAttribute("data-funding-id", "12");
    expect(flow).toHaveAttribute("data-collected-amount", "0");
  });

  it("달성률이 100% 미만이면 친구 수와 확정 금액만 보여주고 '목표 달성'은 붙이지 않는다", () => {
    mockQuery({ data: makeResult(5, 99, 215000) });

    render(<FundingRevealContainer />);

    expect(
      screen.getByRole("heading", { name: /친구 5명이\s*보탬을 보냈어요!/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("215,000원이 모였어요")).toBeInTheDocument();
    expect(screen.queryByText(/목표 달성/)).not.toBeInTheDocument();
    expect(screen.getByTestId("reveal-motion")).toHaveTextContent("5");
  });

  it("달성률이 100% 이상이면 금액 문구 뒤에 ' · 목표 달성'을 붙인다", () => {
    mockQuery({ data: makeResult(8, 100, 429000) });

    render(<FundingRevealContainer />);

    expect(
      screen.getByRole("heading", { name: /친구 8명이\s*보탬을 보냈어요!/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("429,000원이 모였어요 · 목표 달성")).toBeInTheDocument();
  });

  it("친구 수 문구는 보탬 줄 수가 아니라 participantCount를 쓴다", () => {
    mockQuery({ data: makeResult(3, 50, 100000, { participantCount: 2 }) });

    render(<FundingRevealContainer />);

    expect(
      screen.getByRole("heading", { name: /친구 2명이\s*보탬을 보냈어요!/ }),
    ).toBeInTheDocument();
  });

  it("'메시지 열어보기'를 누르면 팡을 열고 메세지 도착 시트를 띄운다", async () => {
    const result = makeResult(5, 59, 215000);
    mockQuery({ data: result });
    resolveOpenWith({ ...result, resultOpenedAt: "2026-11-15T00:00:00" });
    render(<FundingRevealContainer />);
    expect(screen.queryByTestId("rolling-paper")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "메시지 열어보기" }));

    expect(mutate).toHaveBeenCalledWith(12, expect.any(Object));
    expect(screen.getByTestId("rolling-paper")).toHaveAttribute("data-funding-id", "12");
  });

  it("남긴 메세지가 없으면 시트 없이 선물 확인 화면으로 이동한다", async () => {
    const result = makeResult(3, 59, 215000, { messageCount: 0 });
    mockQuery({ data: result });
    resolveOpenWith(result);
    render(<FundingRevealContainer />);

    await userEvent.click(screen.getByRole("button", { name: "메시지 열어보기" }));

    expect(push).toHaveBeenCalledWith("/funding/12/result");
    expect(screen.queryByTestId("rolling-paper")).not.toBeInTheDocument();
  });

  it("이미 팡을 연 결과면 다시 열지 않고 바로 시트를 띄운다", async () => {
    mockQuery({ data: makeResult(5, 59, 215000, { resultOpenedAt: "2026-11-15T00:00:00" }) });
    render(<FundingRevealContainer />);

    await userEvent.click(screen.getByRole("button", { name: "메시지 열어보기" }));

    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByTestId("rolling-paper")).toBeInTheDocument();
  });

  it("시트를 열면 URL에 열림 표시를 남겨, 상세에서 뒤로 와도 시트가 열린 채로 복원된다", async () => {
    const result = makeResult(5, 59, 215000, { resultOpenedAt: "2026-11-15T00:00:00" });
    mockQuery({ data: result });
    const { unmount } = render(<FundingRevealContainer />);

    await userEvent.click(screen.getByRole("button", { name: "메시지 열어보기" }));
    expect(window.location.search).toBe("?messages=open");

    // 상세에서 뒤로 가기: 화면이 새로 마운트되고 URL의 열림 표시를 읽는다
    unmount();
    search = window.location.search;
    render(<FundingRevealContainer />);
    expect(screen.getByTestId("rolling-paper")).toBeInTheDocument();
  });

  it("시트의 닫기를 누르면 첫 화면이 아니라 홈으로 replace 한다", async () => {
    search = "messages=open";
    mockQuery({ data: makeResult(5, 59, 215000) });
    render(<FundingRevealContainer />);

    await userEvent.click(screen.getByRole("button", { name: "시트 닫기" }));

    expect(replace).toHaveBeenCalledWith("/home");
  });

  it("팡 열기 요청 중에는 버튼을 막아 다시 누를 수 없다", async () => {
    mockQuery({ data: makeResult(5, 59, 215000) });
    render(<FundingRevealContainer />);

    const button = screen.getByRole("button", { name: "메시지 열어보기" });
    await userEvent.click(button);
    await userEvent.click(button);

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
  });

  it("팡 열기가 실패하면 버튼 잠금을 풀어 다시 시도할 수 있다", async () => {
    mockQuery({ data: makeResult(5, 59, 215000) });
    mutate.mockImplementation((_id: number, options: { onSettled: () => void }) =>
      options.onSettled(),
    );
    render(<FundingRevealContainer />);

    const button = screen.getByRole("button", { name: "메시지 열어보기" });
    await userEvent.click(button);

    expect(button).toBeEnabled();
    expect(screen.queryByTestId("rolling-paper")).not.toBeInTheDocument();
  });

  it("헤더의 '닫기'를 누르면 홈으로 replace 한다", async () => {
    mockQuery({ data: makeResult(5, 59, 215000) });
    render(<FundingRevealContainer />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/home"));
  });

  const getEndButton = () => screen.getByRole("button", { name: "펀딩 마감하기" });

  it("'펀딩 마감하기'를 누르면 펀딩 종료를 요청하고, 성공한 뒤에 토스트를 예약하고 홈으로 replace 한다", async () => {
    mockQuery({ data: makeResult(0, 0, 0) });
    render(<FundingRevealContainer />);

    await userEvent.click(getEndButton());

    expect(closeFunding).toHaveBeenCalledWith(12, expect.any(Object));
    expect(replace).not.toHaveBeenCalled();
    expect(useFundingCloseToastStore.getState().pending).toBe(false);

    act(() => closeFunding.mock.calls[0]![1].onSuccess());

    expect(replace).toHaveBeenCalledWith("/home");
    expect(useFundingCloseToastStore.getState().pending).toBe(true);
  });

  it("종료 요청 중에는 '펀딩 마감하기'와 '기간 연장하러 가기'를 막아 다시 누를 수 없다", async () => {
    mockQuery({ data: makeResult(0, 0, 0) });
    render(<FundingRevealContainer />);

    const button = getEndButton();
    await userEvent.click(button);
    await userEvent.click(button);

    expect(closeFunding).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    expect(screen.getByRole("button", { name: "기간 연장하러 가기" })).toBeDisabled();
  });

  it("종료 요청이 실패하면 토스트 예약 없이 화면에 남고 다시 누를 수 있다", async () => {
    mockQuery({ data: makeResult(0, 0, 0) });
    closeFunding.mockImplementation((_id: number, options: { onError: () => void }) =>
      options.onError(),
    );
    render(<FundingRevealContainer />);

    const button = getEndButton();
    await userEvent.click(button);

    expect(replace).not.toHaveBeenCalled();
    expect(useFundingCloseToastStore.getState().pending).toBe(false);
    expect(button).toBeEnabled();
  });

  it("빈 화면에서 헤더의 '닫기'는 펀딩을 종료하지 않고 홈으로만 이동한다", async () => {
    mockQuery({ data: makeResult(0, 0, 0) });
    render(<FundingRevealContainer />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/home"));
    expect(closeFunding).not.toHaveBeenCalled();
    expect(useFundingCloseToastStore.getState().pending).toBe(false);
  });
});
