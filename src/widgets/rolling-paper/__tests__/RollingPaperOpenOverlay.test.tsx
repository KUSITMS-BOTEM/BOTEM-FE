import { render, waitFor } from "@testing-library/react";

import RollingPaperOpenOverlay from "@/widgets/rolling-paper/RollingPaperOpenOverlay";

describe("RollingPaperOpenOverlay", () => {
  it("회색 덮개는 모션 시작 전에 투명하다", () => {
    const { container } = render(<RollingPaperOpenOverlay onCovered={vi.fn()} />);

    expect(container.firstElementChild).toHaveStyle({ opacity: "0" });
  });

  it("모션이 끝나면 onCovered를 한 번 호출한다", async () => {
    const onCovered = vi.fn();
    render(<RollingPaperOpenOverlay onCovered={onCovered} />);

    await waitFor(() => expect(onCovered).toHaveBeenCalledTimes(1), { timeout: 3000 });
  });
});
