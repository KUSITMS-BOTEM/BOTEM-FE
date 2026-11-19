import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GiftVerificationPinnedBanner from "@/widgets/home/GiftVerificationPinnedBanner";

describe("GiftVerificationPinnedBanner", () => {
  it("인증 대기 개수를 보여준다", () => {
    render(<GiftVerificationPinnedBanner count={2} onVerify={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByRole("region", { name: "선물 인증 안내" })).toHaveTextContent("2");
  });

  it("'인증하기'를 누르면 onVerify를 호출한다", async () => {
    const onVerify = vi.fn();
    render(<GiftVerificationPinnedBanner count={2} onVerify={onVerify} onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "인증하기" }));

    expect(onVerify).toHaveBeenCalledTimes(1);
  });

  it("닫기 버튼을 누르면 onClose를 호출한다", async () => {
    const onClose = vi.fn();
    render(<GiftVerificationPinnedBanner count={2} onVerify={vi.fn()} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "선물 인증 안내 닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
