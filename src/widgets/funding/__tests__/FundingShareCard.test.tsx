import { render, screen } from "@testing-library/react";

import FundingShareCard from "@/widgets/funding/FundingShareCard";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

const baseProps = {
  openerName: "지유",
  title: "민지의\n생일 펀딩",
  productName: "소니 WH-1000XM5",
  targetAmount: 123456789,
  deadline: "2026-11-20",
};

describe("FundingShareCard", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 13));
  });
  afterEach(() => vi.useRealTimers());

  it.each(["medium", "large"] as const)("%s 크기에서 선물명·금액·마감일 정보를 보여준다", size => {
    render(<FundingShareCard {...baseProps} size={size} />);

    expect(screen.getByText("소니 WH-1000XM5")).toBeInTheDocument();
    expect(screen.getByText("123,456,789 원")).toBeInTheDocument();
    expect(screen.getByText("11월 20일까지")).toBeInTheDocument();
  });

  it("showBadge 기본값이면 D-day 배지를 보여준다", () => {
    render(<FundingShareCard {...baseProps} />);

    expect(screen.getByText("D-7")).toBeInTheDocument();
  });

  it("showBadge가 false면 D-day 배지를 숨긴다", () => {
    render(<FundingShareCard {...baseProps} showBadge={false} />);

    expect(screen.queryByText("D-7")).not.toBeInTheDocument();
  });

  it("진행률이 0이면 달성률 문구를 숨긴다", () => {
    render(<FundingShareCard {...baseProps} progress={0} />);

    expect(screen.queryByText(/달성/)).not.toBeInTheDocument();
  });

  it("진행률이 없으면 달성률 문구를 숨긴다", () => {
    render(<FundingShareCard {...baseProps} />);

    expect(screen.queryByText(/달성/)).not.toBeInTheDocument();
  });

  it("진행률이 0 초과 60 이하면 '달성!'만 보여준다", () => {
    const { rerender } = render(<FundingShareCard {...baseProps} progress={1} />);
    expect(screen.getByText("1% 달성!")).toBeInTheDocument();

    rerender(<FundingShareCard {...baseProps} progress={60} />);
    expect(screen.getByText("60% 달성!")).toBeInTheDocument();
  });

  it("진행률이 60 초과면 '아주 조금 남았어요!'를 덧붙인다", () => {
    render(<FundingShareCard {...baseProps} progress={61} />);

    expect(screen.getByText("61% 달성! 아주 조금 남았어요!")).toBeInTheDocument();
  });

  it("productImageUrl이 없어도 이미지 없이 렌더된다", () => {
    const { container } = render(<FundingShareCard {...baseProps} />);

    expect(screen.getByText("소니 WH-1000XM5")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  it("productImageUrl이 있으면 상품 이미지를 렌더한다", () => {
    const { container } = render(
      <FundingShareCard {...baseProps} productImageUrl="https://example.com/1.png" />,
    );

    expect(container.querySelector('img[src="https://example.com/1.png"]')).toBeInTheDocument();
  });

  it("개설자 이름으로 여는 칩 문구를 만든다", () => {
    render(<FundingShareCard {...baseProps} />);

    expect(screen.getByText("지유가 여는")).toBeInTheDocument();
  });

  it("개설자 이름에 받침이 있으면 '이'를 붙인다", () => {
    render(<FundingShareCard {...baseProps} openerName="이정민" />);

    expect(screen.getByText("이정민이 여는")).toBeInTheDocument();
  });

  it("title의 줄바꿈 문자를 보존해 두 줄로 나눈다", () => {
    render(<FundingShareCard {...baseProps} />);

    // toHaveTextContent는 공백을 정규화하므로 원문 textContent로 비교한다
    expect(screen.getByText(/민지의/).textContent).toBe("민지의\n생일 펀딩");
  });
});
