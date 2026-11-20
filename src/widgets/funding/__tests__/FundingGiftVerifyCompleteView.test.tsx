import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingGiftVerifyCompleteView from "@/widgets/funding/FundingGiftVerifyCompleteView";

vi.mock("@/components/effects/hero-motion/HeroMotion", () => ({ default: () => null }));

afterEach(() => {
  Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
});

describe("FundingGiftVerifyCompleteView", () => {
  it("인증을 보냈다는 안내를 보여준다", () => {
    render(<FundingGiftVerifyCompleteView fundingId="12" />);

    expect(screen.getByText(/선물 도착 인증을 보냈어요!/)).toBeInTheDocument();
  });

  it("'친구에게 공유하기'를 누르면 해당 펀딩의 공유 링크를 공유한다", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    render(<FundingGiftVerifyCompleteView fundingId="12" />);

    await userEvent.click(screen.getByRole("button", { name: "친구에게 공유하기" }));

    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ url: `${window.location.origin}/share/12` }),
    );
  });
});
