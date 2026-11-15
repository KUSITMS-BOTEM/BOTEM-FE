import { render, screen } from "@testing-library/react";

import RollingPaperLetter from "@/widgets/rolling-paper/RollingPaperLetter";

const LETTER = { text: "생일 축하해!", senderName: "민지" };

describe("RollingPaperLetter", () => {
  it("틀 너비를 편지지 너비(320px)로 나눈 비율로 축소한다", () => {
    const { container } = render(<RollingPaperLetter letter={LETTER} width={160} />);

    expect(container.firstElementChild).toHaveStyle({ scale: "0.5" });
  });

  it("본문은 접근 가능하게 두고 슬롯만 inert로 눌림·포커스를 막는다", () => {
    const { container } = render(<RollingPaperLetter letter={LETTER} width={320} />);
    const inertEl = container.querySelector("[inert]");

    expect(container.firstElementChild).not.toHaveAttribute("inert");
    expect(inertEl).not.toContainElement(screen.getByText("생일 축하해!"));
    expect(inertEl).toContainElement(
      screen.getByRole("button", { name: "사진 선택", hidden: true }),
    );
  });
});
