import { useReducedMotion } from "framer-motion";
import { render } from "@testing-library/react";

import WishSearchIllustration from "@/components/effects/WishSearchIllustration";

vi.mock("framer-motion", async importOriginal => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(useReducedMotion).mockReturnValue(false);
});

describe("WishSearchIllustration", () => {
  it("장식 그래픽이라 루트가 aria-hidden이다", () => {
    const { container } = render(<WishSearchIllustration />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("className prop이 루트에 적용된다", () => {
    const { container } = render(<WishSearchIllustration className="custom-search" />);

    expect(container.firstElementChild).toHaveClass("custom-search");
  });

  it("모션 감소 설정이어도 상품 칸 6개와 돋보기를 그대로 렌더한다", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(<WishSearchIllustration />);

    expect(container.querySelectorAll(".size-10")).toHaveLength(6);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
