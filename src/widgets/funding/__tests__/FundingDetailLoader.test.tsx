import { render, screen } from "@testing-library/react";

import { FUNDING_DETAIL } from "@/widgets/funding/__tests__/fixtures/fundingDetail";
import FundingDetailLoader from "@/widgets/funding/FundingDetailLoader";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const queryState = vi.hoisted(() => ({
  current: {} as Record<string, unknown>,
}));
vi.mock("@/hooks/queries/funding/useFundingDetailQuery", () => ({
  useFundingDetailQuery: () => queryState.current,
}));

const hostState = vi.hoisted(() => ({
  management: {} as Record<string, unknown>,
  pending: {} as Record<string, unknown>,
}));
vi.mock("@/hooks/queries/funding/useFundingManagementQuery", () => ({
  useFundingManagementQuery: () => hostState.management,
}));
vi.mock("@/hooks/queries/contribution/usePendingContributionItemsQuery", () => ({
  usePendingContributionItemsQuery: () => hostState.pending,
}));

vi.mock("@/hooks/mutations/auth/useKakaoLoginUriMutation", () => ({
  useKakaoLoginUriMutation: () => ({ mutate: vi.fn() }),
}));
vi.mock("@/hooks/queries/contribution/useMyContributionsQuery", () => ({
  useMyContributionsQuery: () => ({ data: undefined, isPending: false }),
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
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as Record<string, string>)} />
  ),
}));

const setQuery = (state: Record<string, unknown>) => {
  queryState.current = { isError: false, isFetchedAfterMount: true, refetch: vi.fn(), ...state };
};

const setHost = (management: Record<string, unknown>, pending: Record<string, unknown>) => {
  hostState.management = { isError: false, refetch: vi.fn(), ...management };
  hostState.pending = { isError: false, refetch: vi.fn(), ...pending };
};

describe("FundingDetailLoader", () => {
  beforeEach(() => setHost({ data: undefined }, { data: undefined }));
  afterEach(() => replace.mockClear());

  it("개설자 화면은 관리 정보·확인 대기 목록이 오기 전까지 스켈레톤을 보여준다", () => {
    setQuery({ data: FUNDING_DETAIL });
    render(<FundingDetailLoader fundingId="1" variant="owner" />);

    expect(screen.getByLabelText("펀딩 불러오는 중")).toBeInTheDocument();
  });

  it("개설자 화면은 관리 정보 조회가 실패하면 에러 화면에서 그 쿼리를 다시 시도한다", () => {
    const refetch = vi.fn();
    setQuery({ data: FUNDING_DETAIL });
    setHost({ data: undefined, isError: true, refetch }, { data: undefined });
    render(<FundingDetailLoader fundingId="1" variant="owner" />);

    screen.getByRole("button", { name: "다시 시도" }).click();
    expect(refetch).toHaveBeenCalled();
  });

  it("개설자 화면은 확인 대기 목록 조회가 실패해도 에러 화면을 보여준다", () => {
    setQuery({ data: FUNDING_DETAIL });
    setHost({ data: undefined }, { data: undefined, isError: true });
    render(<FundingDetailLoader fundingId="1" variant="owner" />);

    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });

  it("데이터가 없으면 스켈레톤을 보여준다", () => {
    setQuery({ data: undefined });
    render(<FundingDetailLoader fundingId="1" />);

    expect(screen.getByLabelText("펀딩 불러오는 중")).toBeInTheDocument();
  });

  it("조회에 실패하면 에러 화면에서 다시 시도할 수 있다", () => {
    const refetch = vi.fn();
    setQuery({ data: undefined, isError: true, refetch });
    render(<FundingDetailLoader fundingId="1" />);

    screen.getByRole("button", { name: "다시 시도" }).click();
    expect(refetch).toHaveBeenCalled();
  });

  it("로그인 회원은 토큰 재조회가 끝나기 전까지 스켈레톤을 보여준다", () => {
    setQuery({ data: FUNDING_DETAIL, isFetchedAfterMount: false });
    render(<FundingDetailLoader fundingId="1" isLoggedIn />);

    expect(screen.getByLabelText("펀딩 불러오는 중")).toBeInTheDocument();
  });

  it("공유 링크로 들어온 개설자는 기존 펀딩 화면으로 보낸다", () => {
    setQuery({ data: { ...FUNDING_DETAIL, ownerPreview: true } });
    render(<FundingDetailLoader fundingId="1" isLoggedIn />);

    expect(replace).toHaveBeenCalledWith("/funding/1");
    expect(screen.getByLabelText("펀딩 불러오는 중")).toBeInTheDocument();
  });

  it("개설자가 아니면 공유 화면을 그대로 보여준다", () => {
    setQuery({ data: FUNDING_DETAIL });
    render(<FundingDetailLoader fundingId="1" isLoggedIn />);

    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { level: 1, name: "민재의 생일" })).toBeInTheDocument();
  });
});
