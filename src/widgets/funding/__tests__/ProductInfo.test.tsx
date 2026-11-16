import { render, screen } from "@testing-library/react";

import ProductInfo from "@/widgets/funding/ProductInfo";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as Record<string, string>)} />
  ),
}));

describe("ProductInfo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-16T03:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("상품명을 보여준다", () => {
    render(<ProductInfo productImageUrl="/a.png" productName="에어팟" deadline="2026-11-23" />);

    expect(screen.getByText("에어팟")).toBeInTheDocument();
  });

  it("마감일과 남은 일수를 '마감 M월 D일 · D-n' 형식으로 보여준다", () => {
    render(<ProductInfo productImageUrl="/a.png" productName="에어팟" deadline="2026-11-23" />);

    expect(screen.getByText("마감 11월 23일 · D-7")).toBeInTheDocument();
  });

  it("날짜 형식이 틀려 D-day를 계산할 수 없으면 구분자(·) 없이 보여준다", () => {
    render(<ProductInfo productImageUrl="/a.png" productName="에어팟" deadline="2026-02-31" />);

    expect(screen.getByText("마감 2월 31일")).toBeInTheDocument();
  });
});
