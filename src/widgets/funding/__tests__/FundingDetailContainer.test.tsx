import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingDetailContainer from "@/widgets/funding/FundingDetailContainer";

const push = vi.fn();
const back = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, back, replace: vi.fn() }) }));

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

    expect(push).toHaveBeenCalledWith("/friends/7");
  });

  it("친구 id가 없으면 개설자도 대상자도 아니므로 일반 펀딩 화면을 보여준다", () => {
    render(<FundingDetailContainer fundingId="1" />);

    expect(screen.queryByText("아직 비밀이에요")).not.toBeInTheDocument();
    expect(screen.queryByText("확인 대기 1건이 있어요")).not.toBeInTheDocument();
    expect(screen.getByText("나도 지유님께 보태볼까요?")).toBeInTheDocument();
  });
});
