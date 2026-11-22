import { fireEvent, render, screen } from "@testing-library/react";

import FundedCard from "@/widgets/funding/FundedCard";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as Record<string, string>)} />
  ),
}));

const BASE = {
  productName: "에어팟",
  productImageUrl: "/airpods.png",
  relationship: "OPENED",
  fundingType: "BIRTHDAY",
  celebrantName: "서준",
  rollingPaperCount: 8,
} as const;

describe("FundedCard", () => {
  it("롤링페이퍼 개수를 참여 인원으로 보여주고, 공개 전(null)이면 설명을 그리지 않는다", () => {
    const { rerender } = render(<FundedCard {...BASE} />);
    expect(screen.getByText("8명 참여")).toBeInTheDocument();

    rerender(<FundedCard {...BASE} rollingPaperCount={null} />);
    expect(screen.queryByText(/명 참여/)).not.toBeInTheDocument();
  });

  it.each([
    ["OPENED", "BIRTHDAY", ["내가 열었어요", "내 생일"]],
    ["OPENED", "SURPRISE", ["내가 열었어요", "서준 서프라이즈"]],
    ["RECEIVED", "SURPRISE", ["내가 받았어요", "서준 서프라이즈"]],
    ["PARTICIPATED", "BIRTHDAY", ["내가 참여했어요", "서준의 생일"]],
  ] as const)("%s·%s 배지를 보여준다", (relationship, fundingType, labels) => {
    const { container } = render(
      <FundedCard {...BASE} relationship={relationship} fundingType={fundingType} />,
    );

    const badges = [...container.querySelectorAll("span.rounded-lg")].map(el => el.textContent);
    expect(badges).toEqual(labels);
  });

  it("href가 있으면 링크로 그리고, 없으면 링크와 chevron 없이 그린다", () => {
    const { container, rerender } = render(<FundedCard {...BASE} href="/funding/1" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/funding/1");
    expect(container.querySelector("svg")).toBeInTheDocument();

    rerender(<FundedCard {...BASE} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("이미지 URL이 비어 있으면 이미지를 그리지 않는다", () => {
    const { container } = render(<FundedCard {...BASE} productImageUrl="" />);

    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("이미지 로드에 실패하면 이미지를 지운다", () => {
    const { container } = render(<FundedCard {...BASE} />);

    fireEvent.error(container.querySelector("img")!);

    expect(container.querySelector("img")).not.toBeInTheDocument();
  });
});
