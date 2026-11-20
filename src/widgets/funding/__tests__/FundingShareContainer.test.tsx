import { render, screen } from "@testing-library/react";

import FundingShareContainer from "@/widgets/funding/FundingShareContainer";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/hooks/mutations/auth/useKakaoLoginUriMutation", () => ({
  useKakaoLoginUriMutation: () => ({ mutate: vi.fn() }),
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

  it("로그인 여부가 전달되어 로그인 회원이면 '내 보탬 확인'만 보인다", () => {
    render(<FundingShareContainer fundingId="1" isLoggedIn />);

    expect(screen.getByRole("button", { name: "내 보탬 확인" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "보태러 가기" })).not.toBeInTheDocument();
  });
});
