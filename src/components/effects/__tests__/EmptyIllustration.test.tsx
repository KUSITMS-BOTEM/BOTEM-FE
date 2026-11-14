import { useReducedMotion } from "framer-motion";
import { render } from "@testing-library/react";

import EmptyIllustration from "@/components/effects/EmptyIllustration";

vi.mock("framer-motion", async importOriginal => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(useReducedMotion).mockReturnValue(false);
});

describe("EmptyIllustration", () => {
  it("루트가 aria-hidden이다", () => {
    const { container } = render(<EmptyIllustration />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("className prop이 루트에 적용된다", () => {
    const { container } = render(<EmptyIllustration className="custom-empty" />);

    expect(container.firstElementChild).toHaveClass("custom-empty");
  });

  it("모션 감소 설정이어도 점 세 개를 그대로 렌더한다", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);

    const { container } = render(<EmptyIllustration />);

    expect(container.querySelectorAll(".size-2\\.5")).toHaveLength(3);
  });
});
