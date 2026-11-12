import { render } from "@testing-library/react";

import RollingPaperCard from "@/widgets/rolling-paper/RollingPaperCard";
import type { CardPose } from "@/widgets/rolling-paper/rollingPaperMotion";

describe("RollingPaperCard", () => {
  it("첫 포즈의 크기가 초기 스타일로 적용된다", () => {
    const poses: CardPose[] = [
      { x: 0, y: 0, rotate: 0, width: 100, height: 120, borderRadius: 8 },
      { x: 0, y: 0, rotate: 0, width: 200, height: 240, borderRadius: 16 },
    ];

    const { container } = render(<RollingPaperCard poses={poses} />);

    expect(container.firstElementChild).toHaveStyle({ width: "100px", height: "120px" });
  });
});
