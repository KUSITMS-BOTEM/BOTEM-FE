import { render, screen, waitFor } from "@testing-library/react";

import LiveCaption from "@/widgets/letter-paper/LiveCaption";

// jsdom은 레이아웃이 없어 폭이 늘 0이라, 줄 폭은 글자 수로 흉내 낸다(10자를 넘으면 넘침)
function mockLineWidth() {
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.textContent?.length ?? 0;
  });
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(10);
}

describe("LiveCaption", () => {
  afterEach(() => vi.restoreAllMocks());

  it("확정 자막과 진행 중 자막을 이어서 보여준다", () => {
    render(<LiveCaption transcript="생일 축하해" interim="그래서 내가" />);

    expect(screen.getByText("생일")).toHaveClass("text-semantic-text-strong");
    expect(screen.getByText("내가")).toHaveClass("text-semantic-text-quaternary");
  });

  it("한 줄에 담기지 않으면 앞 줄이 사라지고 넘친 단어부터 다음 줄로 이어진다", async () => {
    mockLineWidth();

    const { container } = render(<LiveCaption transcript="생일 축하해 그래서 내가" interim="" />);

    await waitFor(() => expect(screen.queryByText("생일")).not.toBeInTheDocument());
    expect(container).toHaveTextContent("내가");
  });

  it("자막이 없으면 비어 있다", () => {
    const { container } = render(<LiveCaption transcript="" interim="" />);

    expect(container).toHaveTextContent("");
  });
});
