import { render, screen } from "@testing-library/react";

import FundingShareContainer from "@/widgets/funding/FundingShareContainer";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/hooks/mutations/auth/useKakaoLoginUriMutation", () => ({
  useKakaoLoginUriMutation: () => ({ mutate: vi.fn() }),
}));
// 로그인 회원은 서버가 알려준 보탬 여부로 하단 버튼이 정해진다
let myContributionCount = 0;
vi.mock("@/hooks/queries/contribution/useMyContributionsQuery", () => ({
  // 실제 훅처럼 꺼져 있으면(비로그인) 데이터가 없다
  useMyContributionsQuery: (_fundingId: number, enabled: boolean) => ({
    data: enabled
      ? { contributions: Array.from({ length: myContributionCount }, () => ({})) }
      : undefined,
    isPending: false,
  }),
}));
vi.mock("@/hooks/mutations/contribution/useAccessGuestContributionMutation", () => ({
  useAccessGuestContributionMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
}));
vi.mock("@/hooks/queries/user/useMyProfileQuery", () => ({
  useMyProfileQuery: () => ({ data: { name: "민지" } }),
}));
vi.mock("@/hooks/queries/funding/useFundingDetailQuery", async () => {
  const { FUNDING_DETAIL } = await import("@/widgets/funding/__tests__/fixtures/fundingDetail");
  return {
    useFundingDetailQuery: () => ({
      data: FUNDING_DETAIL,
      isError: false,
      isFetchedAfterMount: true,
      refetch: vi.fn(),
    }),
  };
});

// 공유(guest) 화면은 개설자용 쿼리를 쓰지 않는다
vi.mock("@/hooks/queries/funding/useFundingManagementQuery", () => ({
  useFundingManagementQuery: () => ({ data: undefined, isError: false }),
}));
vi.mock("@/hooks/queries/contribution/usePendingContributionItemsQuery", () => ({
  usePendingContributionItemsQuery: () => ({ data: undefined, isError: false }),
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as Record<string, string>)} />
  ),
}));

describe("FundingShareContainer", () => {
  it("비회원 공유 화면으로 렌더되어 하단에 '내 보탬 확인'·'보태러가기'가 보인다", () => {
    render(<FundingShareContainer fundingId="1" />);

    expect(screen.getByRole("button", { name: "내 보탬 확인" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "보태러 가기" })).toBeInTheDocument();
  });

  it("로그인 회원이 이 펀딩에 보탰으면 '내 보탬 확인'만 보인다", () => {
    myContributionCount = 1;
    render(<FundingShareContainer fundingId="1" isLoggedIn />);

    expect(screen.getByRole("button", { name: "내 보탬 확인" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "보태러 가기" })).not.toBeInTheDocument();
  });

  it("로그인 회원이 이 펀딩에 보태지 않았으면 '메시지 보태기'/'보태기'만 보인다", () => {
    myContributionCount = 0;
    render(<FundingShareContainer fundingId="1" isLoggedIn />);

    expect(screen.getByRole("button", { name: "보태기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "내 보탬 확인" })).not.toBeInTheDocument();
  });
});
