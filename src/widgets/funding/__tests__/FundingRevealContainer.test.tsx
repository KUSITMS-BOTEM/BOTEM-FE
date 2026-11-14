import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useFundingRevealQuery } from "@/hooks/queries/funding/useFundingRevealQuery";
import type { FundingRevealResponse } from "@/types/funding/funding";
import FundingRevealContainer from "@/widgets/funding/FundingRevealContainer";

vi.mock("@/hooks/queries/funding/useFundingRevealQuery", () => ({
  useFundingRevealQuery: vi.fn(),
}));
vi.mock("@/components/effects/RevealMotion", () => ({
  default: ({ names }: { names: string[] }) => (
    <div data-testid="reveal-motion">{names.length}</div>
  ),
}));
vi.mock("@/components/effects/EmptyIllustration", () => ({
  default: () => <div data-testid="empty-illustration" />,
}));

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useParams: () => ({ fundingId: "12" }),
}));

const refetch = vi.fn();

const mockQuery = (value: { data?: FundingRevealResponse; isLoading?: boolean }) => {
  vi.mocked(useFundingRevealQuery).mockReturnValue({
    data: undefined,
    isLoading: false,
    refetch,
    ...value,
  } as unknown as ReturnType<typeof useFundingRevealQuery>);
};

const makeReveal = (count: number, goalAchieved: boolean, totalAmount: number) => ({
  contributorNames: Array.from({ length: count }, (_, i) => `친구${i + 1}`),
  totalAmount,
  goalAchieved,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FundingRevealContainer", () => {
  it("useParams의 fundingId를 숫자로 바꿔 쿼리를 호출한다", () => {
    mockQuery({ isLoading: true });

    render(<FundingRevealContainer />);

    expect(useFundingRevealQuery).toHaveBeenCalledWith(12);
  });

  it("로딩 중이면 결과·에러·빈 화면 본문을 렌더하지 않는다", () => {
    mockQuery({ isLoading: true });

    render(<FundingRevealContainer />);

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
    mockQuery({ data: makeReveal(0, false, 0) });

    render(<FundingRevealContainer />);

    expect(screen.getByRole("heading", { name: "이번엔 조용히 지나갔어요" })).toBeInTheDocument();
    expect(screen.queryByTestId("reveal-motion")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "메시지 열어보기" })).not.toBeInTheDocument();
  });

  it("목표 미달성이면 친구 수와 금액만 보여주고 '목표 달성'은 붙이지 않는다", () => {
    mockQuery({ data: makeReveal(5, false, 215000) });

    render(<FundingRevealContainer />);

    expect(
      screen.getByRole("heading", { name: /친구 5명이\s*보탬을 보냈어요!/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("215,000원이 모였어요")).toBeInTheDocument();
    expect(screen.queryByText(/목표 달성/)).not.toBeInTheDocument();
    expect(screen.getByTestId("reveal-motion")).toHaveTextContent("5");
  });

  it("목표 달성이면 금액 문구 뒤에 ' · 목표 달성'을 붙인다", () => {
    mockQuery({ data: makeReveal(8, true, 429000) });

    render(<FundingRevealContainer />);

    expect(
      screen.getByRole("heading", { name: /친구 8명이\s*보탬을 보냈어요!/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("429,000원이 모였어요 · 목표 달성")).toBeInTheDocument();
  });

  it("결과 화면에 '메시지 열어보기' 버튼을 보여준다", () => {
    mockQuery({ data: makeReveal(5, false, 215000) });

    render(<FundingRevealContainer />);

    expect(screen.getByRole("button", { name: "메시지 열어보기" })).toBeInTheDocument();
  });

  it("헤더의 '닫기'를 누르면 홈으로 replace 한다", async () => {
    mockQuery({ data: makeReveal(5, false, 215000) });
    render(<FundingRevealContainer />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(replace).toHaveBeenCalledWith("/home");
  });

  it("빈 화면의 '닫기'를 누르면 홈으로 replace 한다", async () => {
    mockQuery({ data: makeReveal(0, false, 0) });
    render(<FundingRevealContainer />);

    const closeButtons = screen.getAllByRole("button", { name: "닫기" });
    await userEvent.click(closeButtons[closeButtons.length - 1]!);

    expect(replace).toHaveBeenCalledWith("/home");
    expect(replace).toHaveBeenCalledTimes(1);
  });
});
