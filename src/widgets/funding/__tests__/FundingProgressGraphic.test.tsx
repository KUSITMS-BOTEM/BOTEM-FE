import { render } from "@testing-library/react";
import { useReducedMotion } from "framer-motion";

import FundingProgressGraphic from "@/widgets/funding/FundingProgressGraphic";

vi.mock("framer-motion", async importOriginal => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: vi.fn(() => false),
}));

// 레이어 구성: 뒤 그림자 + 유리 외곽선은 항상, 라임은 유리 채우기, disabled가 아니면 물결 레이어
const countSvg = (container: HTMLElement) => container.querySelectorAll("svg").length;

describe("FundingProgressGraphic", () => {
  it("장식 요소라 스크린리더에서 숨긴다", () => {
    const { container } = render(<FundingProgressGraphic color="orange" />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("orange는 그림자·유리 외곽선·물결 3개 레이어를 그린다", () => {
    const { container } = render(<FundingProgressGraphic color="orange" />);

    expect(countSvg(container)).toBe(3);
  });

  it("lime만 유리 채우기가 하나 더 있다", () => {
    const { container } = render(<FundingProgressGraphic color="lime" />);

    expect(countSvg(container)).toBe(4);
  });

  it("disabled는 물결 없이 그림자·유리 외곽선만 그린다", () => {
    const { container } = render(<FundingProgressGraphic color="disabled" />);

    expect(countSvg(container)).toBe(2);
  });

  it("모션 감소 설정이어도 같은 레이어를 정지 상태로 그린다", () => {
    vi.mocked(useReducedMotion).mockReturnValueOnce(true);

    const { container } = render(<FundingProgressGraphic color="orange" />);

    expect(countSvg(container)).toBe(3);
  });
});
