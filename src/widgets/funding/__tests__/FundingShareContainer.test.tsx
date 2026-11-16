import { render, screen } from "@testing-library/react";

import FundingShareContainer from "@/widgets/funding/FundingShareContainer";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as Record<string, string>)} />
  ),
}));

describe("FundingShareContainer", () => {
  it("펀딩 제목과 '나도 보태볼까요?' 버튼을 보여준다", () => {
    render(<FundingShareContainer fundingId="1" />);

    expect(screen.getByRole("heading", { level: 1, name: "지유의 생일" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /나도 지유님께 보태볼까요\?/ })).toBeInTheDocument();
  });

  it("헤더에 공유·더보기 버튼이 있고 뒤로가기 버튼은 없다", () => {
    render(<FundingShareContainer fundingId="1" />);

    expect(screen.getByRole("button", { name: "공유" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "더보기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /뒤로/ })).not.toBeInTheDocument();
  });

  it("진행 카드와 사연(Message)을 함께 보여준다", () => {
    render(<FundingShareContainer fundingId="1" />);

    expect(
      screen.getByRole("region", { name: "소니 WH-1000XM5 펀딩 진행 상황" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/올해 생일엔 출퇴근길에 쓸 노캔 헤드폰/, {
        selector: "p:not([aria-hidden])",
      }),
    ).toBeInTheDocument();
  });
});
