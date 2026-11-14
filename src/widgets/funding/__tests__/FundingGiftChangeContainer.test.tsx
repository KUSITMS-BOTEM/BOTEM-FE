import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingGiftChangeContainer from "@/widgets/funding/FundingGiftChangeContainer";

const back = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back, push }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FundingGiftChangeContainer", () => {
  it("임시 데이터로 기존 선물과 위시 목록을 보여준다", () => {
    render(<FundingGiftChangeContainer />);

    expect(screen.getByText("기존 선물")).toBeInTheDocument();
    expect(screen.getByText("위시에서 다른 상품 고르기")).toBeInTheDocument();
  });

  it("뒤로 가기를 누르면 router.back이 호출된다", async () => {
    const user = userEvent.setup();
    render(<FundingGiftChangeContainer />);

    await user.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(back).toHaveBeenCalledTimes(1);
  });

  it("'상품 보기'를 누르면 추천 상품 목록으로 이동한다", async () => {
    const user = userEvent.setup();
    render(<FundingGiftChangeContainer />);

    await user.click(screen.getByRole("button", { name: /상품 보기/ }));

    expect(push).toHaveBeenCalledWith("/wish/recommended");
  });
});
