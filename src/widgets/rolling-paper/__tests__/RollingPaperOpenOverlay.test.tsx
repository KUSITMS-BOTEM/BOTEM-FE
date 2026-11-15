import { render, waitFor } from "@testing-library/react";

import RollingPaperOpenOverlay from "@/widgets/rolling-paper/RollingPaperOpenOverlay";

const backgroundRef = { current: document.createElement("div") };

describe("RollingPaperOpenOverlay", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("회색 영역을 재지 못해도(ref가 비어 있어도) 덮개가 끝까지 동작한다", async () => {
    const onCovered = vi.fn();
    render(<RollingPaperOpenOverlay backgroundRef={{ current: null }} onCovered={onCovered} />);

    await waitFor(() => expect(onCovered).toHaveBeenCalledTimes(1), { timeout: 3000 });
  });

  it("시작 모양을 시트 대비 회색 영역의 실제 위치로 정한다", () => {
    const sheetRect = { top: 0, right: 360, bottom: 800, left: 0 } as DOMRect;
    const backgroundRect = { top: 166, right: 340, bottom: 600, left: 20 } as DOMRect;
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (
      this: Element,
    ) {
      return this === backgroundRef.current ? backgroundRect : sheetRect;
    });

    const { container } = render(
      <RollingPaperOpenOverlay backgroundRef={backgroundRef} onCovered={vi.fn()} />,
    );

    expect((container.firstElementChild as HTMLElement).style.clipPath).toBe(
      "inset(166px 20px 200px 20px round 16px)",
    );
  });
});
