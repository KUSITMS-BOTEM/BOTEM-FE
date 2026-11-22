import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingLockedView from "@/widgets/funding/FundingLockedView";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("FundingLockedView", () => {
  afterEach(() => vi.clearAllMocks());

  it("비밀 안내와 공개 시각을 보여준다", () => {
    render(<FundingLockedView revealDateLabel="10월 13일 0시" />);

    expect(screen.getByText("아직 비밀이에요")).toBeInTheDocument();
    expect(screen.getByText("10월 13일 0시에 만나요!")).toBeInTheDocument();
  });

  it("뒤로가기 버튼이 없다", () => {
    render(<FundingLockedView revealDateLabel="10월 13일 0시" />);

    expect(screen.queryByRole("button", { name: "뒤로가기" })).not.toBeInTheDocument();
  });

  it("공개 시각을 모르면 날짜 없이 안내한다", () => {
    render(<FundingLockedView />);

    expect(screen.getByText("곧 만나요!")).toBeInTheDocument();
  });

  it("카카오 로그인 동작을 넘기면 로그인 안내와 '로그인하고 보태기' 버튼을 보여준다", async () => {
    const onKakaoLogin = vi.fn();
    render(<FundingLockedView revealDateLabel="10월 13일 0시" onKakaoLogin={onKakaoLogin} />);

    expect(screen.getByText("로그인하고 보태러 갈까요?")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "내 홈으로" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "로그인하고 보태기" }));

    expect(onKakaoLogin).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("내 홈으로를 누르면 /home으로 이동한다", async () => {
    render(<FundingLockedView revealDateLabel="10월 13일 0시" />);

    await userEvent.click(screen.getByRole("button", { name: "내 홈으로" }));

    expect(push).toHaveBeenCalledWith("/home");
  });
});
