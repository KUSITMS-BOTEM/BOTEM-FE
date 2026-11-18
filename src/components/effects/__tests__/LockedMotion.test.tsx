import { render } from "@testing-library/react";

import LockedMotion from "@/components/effects/LockedMotion";

describe("LockedMotion", () => {
  it("루트가 aria-hidden이고 className이 병합된다", () => {
    const { container } = render(<LockedMotion className="custom" />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild).toHaveClass("custom", "relative");
  });

  it("컨페티 16개를 렌더한다", () => {
    const { container } = render(<LockedMotion />);

    expect(container.querySelectorAll('[class*="bg-base-"]')).toHaveLength(16);
  });
});
