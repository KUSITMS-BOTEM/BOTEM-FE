import { render, screen } from "@testing-library/react";

import { getFundingCardColor } from "@/utils/funding/getFundingCardColor";
import FundingProgressCard from "@/widgets/funding/FundingProgressCard";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as Record<string, string>)} />
  ),
}));

const BASE = {
  fundingId: 1,
  productImageUrl: "/a.png",
  productName: "에어팟",
  deadline: "2026-11-23",
  currentAmount: 500,
  targetAmount: 1000,
};

describe("FundingProgressCard", () => {
  it("모인 금액이 0이면 첫 보탬 문구와 0%를 보여준다", () => {
    render(<FundingProgressCard {...BASE} currentAmount={0} />);

    expect(screen.getByText("첫 보탬을 기다려요.")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("모인 금액이 있으면 퍼센트와 구간 문구를 보여준다", () => {
    render(<FundingProgressCard {...BASE} />);

    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("점점 채워지고 있어요.")).toBeInTheDocument();
  });

  it("목표 금액을 천단위 구분해서 보여준다", () => {
    render(<FundingProgressCard {...BASE} targetAmount={123456789} />);

    expect(screen.getByText("목표가 123,456,789원")).toBeInTheDocument();
  });

  it("같은 fundingId로 다시 렌더해도 같은 색 클래스를 유지한다", () => {
    const blur = `bg-base-${getFundingCardColor(1)}-200`;
    const { container, rerender } = render(<FundingProgressCard {...BASE} />);
    expect(container.querySelector(`.${blur}`)).toBeInTheDocument();

    rerender(<FundingProgressCard {...BASE} currentAmount={600} />);

    expect(container.querySelector(`.${blur}`)).toBeInTheDocument();
  });

  describe("마감 뱃지", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 10, 16, 12, 0, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("진행 중이면 뱃지가 없다", () => {
      render(<FundingProgressCard {...BASE} />);

      expect(screen.queryByText("마감")).not.toBeInTheDocument();
      expect(screen.queryByText("기간 마감")).not.toBeInTheDocument();
    });

    it("기간이 지나면 기간 마감 뱃지와 D-0을 보여준다", () => {
      render(<FundingProgressCard {...BASE} deadline="2026-11-15" />);

      expect(screen.getByText("기간 마감")).toBeInTheDocument();
      expect(screen.getByText(/D-0$/)).toBeInTheDocument();
    });

    it("기간이 남았어도 목표를 채우면 마감 뱃지를 보여주고 D-day는 유지한다", () => {
      render(<FundingProgressCard {...BASE} currentAmount={1000} />);

      expect(screen.getByText("마감")).toBeInTheDocument();
      expect(screen.getByText(/D-7$/)).toBeInTheDocument();
    });
  });

  it("모인 금액이 0이면 gray 계열 클래스를 쓴다", () => {
    const { container } = render(<FundingProgressCard {...BASE} currentAmount={0} />);

    expect(container.querySelector(".bg-base-gray-200")).toBeInTheDocument();
  });
});
