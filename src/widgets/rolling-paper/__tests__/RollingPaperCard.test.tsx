import { render } from "@testing-library/react";

import RollingPaperCard from "@/widgets/rolling-paper/RollingPaperCard";
import type { RollingCard } from "@/widgets/rolling-paper/rollingPaperMotion";

describe("RollingPaperCard", () => {
  it("카드 크기가 스타일로 적용된다", () => {
    const card: RollingCard = {
      width: 200,
      height: 240,
      poses: [
        { x: 0, y: 0, rotate: 0 },
        { x: 0, y: 0, rotate: 0 },
        { x: 0, y: 0, rotate: 0 },
      ],
    };

    const { container } = render(<RollingPaperCard card={card} />);

    expect(container.firstElementChild).toHaveStyle({ width: "200px", height: "240px" });
  });
});
