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

  it("홈으로 돌아가기를 누르면 /home으로 이동한다", async () => {
    render(<FundingLockedView revealDateLabel="10월 13일 0시" />);

    await userEvent.click(screen.getByRole("button", { name: "홈으로 돌아가기" }));

    expect(push).toHaveBeenCalledWith("/home");
  });
});
