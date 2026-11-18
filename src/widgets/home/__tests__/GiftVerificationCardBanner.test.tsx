import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GiftVerificationCardBanner from "@/widgets/home/GiftVerificationCardBanner";

describe("GiftVerificationCardBanner", () => {
  it("인증 대기 개수를 보여준다", () => {
    render(<GiftVerificationCardBanner count={3} onVerify={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByRole("region", { name: "선물 인증 안내" })).toHaveTextContent("3");
  });

  it("'인증하러 가기'를 누르면 onVerify를 호출한다", async () => {
    const onVerify = vi.fn();
    render(<GiftVerificationCardBanner count={3} onVerify={onVerify} onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "인증하러 가기" }));

    expect(onVerify).toHaveBeenCalledTimes(1);
  });

  it("'선물 인증 안내 닫기'를 누르면 onClose를 호출한다", async () => {
    const onClose = vi.fn();
    render(<GiftVerificationCardBanner count={3} onVerify={vi.fn()} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "선물 인증 안내 닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
