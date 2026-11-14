import { render, waitFor } from "@testing-library/react";

import RollingPaperOpenOverlay from "@/widgets/rolling-paper/RollingPaperOpenOverlay";

const backgroundRef = { current: document.createElement("div") };

describe("RollingPaperOpenOverlay", () => {
  it("회색 덮개는 모션 시작 전에 투명하다", () => {
    const { container } = render(
      <RollingPaperOpenOverlay backgroundRef={backgroundRef} onCovered={vi.fn()} />,
    );

    expect(container.firstElementChild).toHaveStyle({ opacity: "0" });
  });

  it("모션이 끝나면 onCovered를 한 번 호출한다", async () => {
    const onCovered = vi.fn();
    render(<RollingPaperOpenOverlay backgroundRef={backgroundRef} onCovered={onCovered} />);

    await waitFor(() => expect(onCovered).toHaveBeenCalledTimes(1), { timeout: 3000 });
  });
});
