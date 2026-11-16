import { render, screen } from "@testing-library/react";

import ScaledLetterPaper from "@/widgets/letter-paper/ScaledLetterPaper";

const mockClientWidth = (width: number) =>
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, value: width });

describe("ScaledLetterPaper", () => {
  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
  });

  it("부모 가로 실측값 ÷ 320 비율로 확대한다", () => {
    mockClientWidth(640);
    const { container } = render(<ScaledLetterPaper text="안녕" senderName="민지" />);

    const scaled = container.firstElementChild?.firstElementChild as HTMLElement;
    expect(scaled.style.transform).toBe("scale(2)");
  });

  it("실측값이 0이면 배율 1로 그린다", () => {
    mockClientWidth(0);
    const { container } = render(<ScaledLetterPaper text="안녕" senderName="민지" />);

    const scaled = container.firstElementChild?.firstElementChild as HTMLElement;
    expect(scaled.style.transform).toBe("scale(1)");
  });

  it("받은 props를 LetterPaper로 넘긴다", () => {
    mockClientWidth(320);
    render(<ScaledLetterPaper text="생일 축하해!" senderName="민지" />);

    expect(screen.getByText("생일 축하해!")).toBeInTheDocument();
    expect(screen.getByText("From. 민지")).toBeInTheDocument();
  });
});
