import { render } from "@testing-library/react";

import DepositConfirmedAnimation from "@/components/effects/DepositConfirmedAnimation";

describe("DepositConfirmedAnimation", () => {
  it("루트가 aria-hidden이다", () => {
    const { container } = render(<DepositConfirmedAnimation />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("className prop이 루트에 적용된다", () => {
    const { container } = render(<DepositConfirmedAnimation className="custom-deposit" />);

    expect(container.firstElementChild).toHaveClass("custom-deposit");
  });

  it("체크 표시 path를 렌더한다", () => {
    const { container } = render(<DepositConfirmedAnimation />);

    expect(container.querySelector("svg path")).not.toBeNull();
  });
});
