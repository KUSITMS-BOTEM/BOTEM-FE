import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { useFundingDetailQuery } from "@/hooks/queries/funding/useFundingDetailQuery";
import { useFundingContributionStore } from "@/store/fundingContributionStore";
import type { FundingDetailResponse } from "@/types/funding/fundingDetail";
import FundingCompleteContainer from "@/widgets/funding/FundingCompleteContainer";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
}));

vi.mock("@/hooks/queries/funding/useFundingDetailQuery", () => ({
  useFundingDetailQuery: vi.fn(),
}));

vi.mock("@/widgets/funding/FundingCompleteView", () => ({
  default: ({ funding, closePath }: { funding: { giverName: string }; closePath?: string }) => (
    <div data-testid="view" data-close-path={closePath}>
      {funding.giverName}
    </div>
  ),
}));

const detail = {
  fundingId: 12,
  celebrantName: "지유",
  targetAmount: 300000,
  product: { name: "에어팟", imageUrl: "/p.jpg" },
  deadline: "2026-11-30T23:59:59",
  confirmedPercentage: 40,
  pendingPercentage: 10,
  participantCount: 1,
  participants: [{ order: 1, name: "민지", profileImageUrl: null }],
} as FundingDetailResponse;

const renderContainer = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <FundingCompleteContainer shareKey="key" />
    </QueryClientProvider>,
  );

const mockQuery = (state: Record<string, unknown>) =>
  vi.mocked(useFundingDetailQuery).mockReturnValue(state as never);

const setLetter = () => useFundingContributionStore.getState().setLetter({ name: "민지" } as never);

afterEach(() => {
  useFundingContributionStore.getState().reset();
  vi.clearAllMocks();
});

describe("FundingCompleteContainer", () => {
  it("조회 중에는 완료 화면 대신 스켈레톤을 보여준다", () => {
    mockQuery({ data: undefined, isError: false, refetch: vi.fn() });
    renderContainer();

    expect(screen.queryByTestId("view")).not.toBeInTheDocument();
  });

  it("조회에 실패하면 다시 시도 버튼을 보여준다", () => {
    mockQuery({ data: undefined, isError: true, refetch: vi.fn() });
    renderContainer();

    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });

  it("조회가 끝나면 스토어의 이름으로 완료 화면을 그린다", () => {
    setLetter();
    mockQuery({ data: detail, isError: false, refetch: vi.fn() });
    renderContainer();

    expect(screen.getByTestId("view")).toHaveTextContent("민지");
  });

  it("개설자(ownerPreview)면 닫기 경로를 자기 펀딩 화면으로 넘기고, 아니면 넘기지 않는다", () => {
    setLetter();
    mockQuery({ data: { ...detail, ownerPreview: true }, isError: false, refetch: vi.fn() });
    const { unmount } = renderContainer();
    expect(screen.getByTestId("view")).toHaveAttribute("data-close-path", "/funding/12");
    unmount();

    setLetter();
    mockQuery({ data: { ...detail, ownerPreview: false }, isError: false, refetch: vi.fn() });
    renderContainer();
    expect(screen.getByTestId("view")).not.toHaveAttribute("data-close-path");
  });

  it("새로고침으로 편지 입력값이 사라졌으면 공유 페이지로 돌려보낸다", () => {
    mockQuery({ data: detail, isError: false, refetch: vi.fn() });
    renderContainer();

    expect(replaceMock).toHaveBeenCalledWith("/share/key");
    expect(screen.queryByTestId("view")).not.toBeInTheDocument();
  });

  it("편지 입력값이 있으면 공유 페이지로 돌려보내지 않는다", () => {
    setLetter();
    mockQuery({ data: detail, isError: false, refetch: vi.fn() });
    renderContainer();

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("완료 페이지를 떠나면 보태기 플로우 입력값이 초기화된다", () => {
    useFundingContributionStore.getState().setPassword("1234");
    mockQuery({ data: detail, isError: false, refetch: vi.fn() });
    const { unmount } = renderContainer();

    unmount();

    expect(useFundingContributionStore.getState().password).toBe("");
  });
});
