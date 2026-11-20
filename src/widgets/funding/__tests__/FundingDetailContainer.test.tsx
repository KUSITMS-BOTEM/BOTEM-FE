import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingDetailContainer from "@/widgets/funding/FundingDetailContainer";

const push = vi.fn();
const back = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, back, replace: vi.fn() }) }));

// 로그인 뮤테이션은 QueryClient가 필요하므로 대체한다
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

describe("FundingDetailContainer", () => {
  afterEach(() => vi.clearAllMocks());

  it("서프라이즈 펀딩 상세로 자물쇠와 확인 대기 안내를 보여준다", () => {
    render(<FundingDetailContainer fundingId="1" friendId="7" />);

    expect(screen.getByRole("img", { name: "서프라이즈 펀딩" })).toBeInTheDocument();
    expect(screen.getByText("확인 대기 3건이 있어요")).toBeInTheDocument();
  });

  it("뒤로가기를 누르면 친구 프로필로 이동한다", async () => {
    render(<FundingDetailContainer fundingId="1" friendId="7" />);

    await userEvent.click(screen.getByRole("button", { name: "뒤로가기" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/friends/7"));
  });

  it("친구 id가 없으면 mock 역할(펀딩 주인)로 툴팁·자물쇠 없는 펀딩 화면을 보여준다", () => {
    render(<FundingDetailContainer fundingId="1" />);

    expect(screen.queryByText("아직 비밀이에요")).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "서프라이즈 펀딩" })).not.toBeInTheDocument();
    expect(screen.queryByText("나도 민재님께 보태볼까요?")).not.toBeInTheDocument();
  });
});
