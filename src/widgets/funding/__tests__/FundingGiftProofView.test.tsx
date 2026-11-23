import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { handleKakaoLoginClick } from "@/utils/auth/handleKakaoLoginClick";
import FundingGiftProofView from "@/widgets/funding/FundingGiftProofView";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("@/hooks/mutations/auth/useKakaoLoginUriMutation", () => ({
  useKakaoLoginUriMutation: () => ({ mutate: vi.fn() }),
}));
vi.mock("@/utils/auth/handleKakaoLoginClick", () => ({ handleKakaoLoginClick: vi.fn() }));
vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

const IMAGE_URL = "https://image.botem.me/gift.jpg";

const renderView = (props: Partial<Parameters<typeof FundingGiftProofView>[0]> = {}) =>
  render(
    <FundingGiftProofView
      imageUrl={IMAGE_URL}
      contributorCount={8}
      productName="소니 WH-1000XM5"
      isLoggedIn
      {...props}
    />,
  );

describe("FundingGiftProofView", () => {
  beforeEach(() => vi.clearAllMocks());

  it("인증 사진과 마감 안내, 참여 인원·상품명, 말풍선을 보여준다", () => {
    renderView();

    expect(screen.getByRole("img", { name: "선물 도착 인증 사진" })).toHaveAttribute(
      "src",
      IMAGE_URL,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "이미 펀딩이 마감됐어요!선물 인증이 도착했어요",
    );
    expect(screen.getByText(/친구 8명의 보탬으로/)).toHaveTextContent(
      "친구 8명의 보탬으로소니 WH-1000XM5 완성!",
    );
    expect(screen.getByText("나도 받고 싶은게 있다면?")).toBeInTheDocument();
  });

  it("회원은 '위시 추가하고 펀딩 열기'로 펀딩 시트를 열도록 /home?open=funding으로 이동한다", async () => {
    renderView();

    await userEvent.click(screen.getByRole("button", { name: "위시 추가하고 펀딩 열기" }));

    expect(push).toHaveBeenCalledWith("/home?open=funding");
  });

  it("비회원은 '카카오로 이용하기'로 로그인한 뒤 /home?open=funding으로 돌아온다", async () => {
    renderView({ isLoggedIn: false });

    expect(
      screen.queryByRole("button", { name: "위시 추가하고 펀딩 열기" }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "카카오로 이용하기" }));

    expect(handleKakaoLoginClick).toHaveBeenCalledWith(expect.any(Function), "/home?open=funding");
  });

  it("닫기는 /home으로 이동한다", async () => {
    renderView();

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/home"));
  });

  it("http(s)가 아닌 이미지 URL은 렌더하지 않는다", () => {
    renderView({ imageUrl: "javascript:alert(1)" });

    expect(screen.queryByRole("img", { name: "선물 도착 인증 사진" })).not.toBeInTheDocument();
  });
});
