import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingResultContainer from "@/widgets/funding/FundingResultContainer";

const replace = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
}));
vi.mock("@/widgets/funding/FundingResultCelebration", () => ({
  default: () => <div data-testid="celebration" />,
}));

beforeEach(() => vi.clearAllMocks());

describe("FundingResultContainer", () => {
  it("닫기를 누르면 홈으로 이동하며 결과 화면을 히스토리에서 지운다", async () => {
    render(<FundingResultContainer fundingId="7" />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(replace).toHaveBeenCalledWith("/home");
  });

  it("구매 버튼을 누르면 상품 링크를 새 탭(noopener)으로 연다", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<FundingResultContainer fundingId="7" />);

    await userEvent.click(screen.getByRole("button", { name: "쿠팡에서 선물 사러 가기" }));

    expect(open).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\//),
      "_blank",
      "noopener,noreferrer",
    );
    open.mockRestore();
  });
});
