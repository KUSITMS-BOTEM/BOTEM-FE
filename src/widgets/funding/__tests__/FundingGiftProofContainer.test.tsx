import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FUNDING_DETAIL } from "@/widgets/funding/__tests__/fixtures/fundingDetail";
import FundingGiftProofContainer from "@/widgets/funding/FundingGiftProofContainer";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: vi.fn() }) }));

const queryState = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
vi.mock("@/hooks/queries/funding/useFundingDetailQuery", () => ({
  useFundingDetailQuery: () => queryState.current,
}));
vi.mock("@/hooks/mutations/auth/useKakaoLoginUriMutation", () => ({
  useKakaoLoginUriMutation: () => ({ mutate: vi.fn() }),
}));
vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

const refetch = vi.fn();
const setQuery = (state: Record<string, unknown>) => {
  queryState.current = { isError: false, isFetching: false, refetch, ...state };
};

const VERIFIED = {
  ...FUNDING_DETAIL,
  giftVerification: {
    imageUrl: "https://image.botem.me/gift.jpg",
    thankYouMessage: "고마워!",
    completedAt: "2026-11-20T10:00:00",
  },
};

const renderContainer = () =>
  render(<FundingGiftProofContainer shareKey="share-key-1" isLoggedIn={false} />);

describe("FundingGiftProofContainer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("불러오는 중에는 스켈레톤을 보여준다", () => {
    setQuery({ data: undefined });

    renderContainer();

    expect(screen.getByLabelText("선물 인증 불러오는 중")).toBeInTheDocument();
  });

  it("불러오지 못하면 '다시 시도'로 재요청한다", async () => {
    setQuery({ data: undefined, isError: true });
    renderContainer();

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("선물 인증 결과가 있으면 인증 사진과 결과 화면을 보여준다", () => {
    setQuery({ data: VERIFIED });

    renderContainer();

    expect(screen.getByRole("img", { name: "선물 도착 인증 사진" })).toHaveAttribute(
      "src",
      "https://image.botem.me/gift.jpg",
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it("아직 선물 인증 전인 펀딩이면 펀딩 상세로 보낸다", () => {
    setQuery({ data: FUNDING_DETAIL });

    renderContainer();

    expect(replace).toHaveBeenCalledWith("/share/share-key-1");
  });

  it("다시 받는 중에는 인증 전으로 판단해 상세로 보내지 않는다", () => {
    setQuery({ data: FUNDING_DETAIL, isFetching: true });

    renderContainer();

    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByLabelText("선물 인증 불러오는 중")).toBeInTheDocument();
  });

  it("인증 전 캐시가 남은 채 다시 받기에 실패하면 상세로 보내지 않고 재시도 화면을 보여준다", () => {
    setQuery({ data: FUNDING_DETAIL, isError: true });

    renderContainer();

    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });
});
