import { render } from "@testing-library/react";

import ShimmerBar from "@/components/skeleton/ShimmerBar";

describe("ShimmerBar", () => {
  it("className을 전달하면 wrapper에 병합된다", () => {
    const { container } = render(<ShimmerBar className="h-5 w-24" />);

    expect(container.firstChild).toHaveClass("h-5", "w-24");
  });
});
