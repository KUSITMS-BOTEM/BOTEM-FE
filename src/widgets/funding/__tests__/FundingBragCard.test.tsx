import { render, screen } from "@testing-library/react";

import FundingBragCard from "@/widgets/funding/FundingBragCard";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as Record<string, string>)} />
  ),
}));

const renderCard = (deadline: string) =>
  render(
    <FundingBragCard
      giverName="민지"
      recipientName="지유"
      productImageUrl="/product.png"
      productName="소니 WH-1000XM5"
      deadline={deadline}
      reduceMotion
    />,
  );

describe("FundingBragCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 서울 기준 2026-11-16 정오
    vi.setSystemTime(new Date("2026-11-16T03:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("누가 누구에게 보탰는지 문구를 보여준다", () => {
    renderCard("2026-11-20");

    expect(screen.getByText(/민지가 지유에게\s*보탰어요!/)).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "민지님이 지유님에게 보탠 내용" }),
    ).toBeInTheDocument();
  });

  it("보탠 사람 이름에 받침이 있으면 '이'를 붙인다", () => {
    render(
      <FundingBragCard
        giverName="이정민"
        recipientName="서연"
        productImageUrl="/product.png"
        productName="소니 WH-1000XM5"
        deadline="2026-11-20"
        reduceMotion
      />,
    );

    expect(screen.getByText(/이정민이 서연에게\s*보탰어요!/)).toBeInTheDocument();
  });

  it("마감일까지 남은 일수를 D-day 배지로 보여준다", () => {
    renderCard("2026-11-20");

    expect(screen.getByText("D-4")).toBeInTheDocument();
  });

  it("마감일이 오늘이면 D-Day 배지를 보여준다", () => {
    renderCard("2026-11-16");

    expect(screen.getByText("D-Day")).toBeInTheDocument();
  });

  it("날짜 형식이 틀리면 D-day 배지를 보여주지 않는다", () => {
    renderCard("잘못된 날짜");

    expect(screen.queryByText(/^D-/)).not.toBeInTheDocument();
  });

  it("상품명을 보여준다", () => {
    renderCard("2026-11-20");

    expect(screen.getByText("소니 WH-1000XM5")).toBeInTheDocument();
  });
});
