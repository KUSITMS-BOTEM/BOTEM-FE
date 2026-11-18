import { render } from "@testing-library/react";

import FundingResultWishPhoto from "@/widgets/funding/FundingResultWishPhoto";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

const SRC = "https://example.com/item.png";

describe("FundingResultWishPhoto", () => {
  it.each([1, 3, 8])("친구 %i명이면 회색 사진·조각 %i장·컬러 사진을 겹쳐 그린다", count => {
    const { container } = render(
      <FundingResultWishPhoto productImage={SRC} sliceCount={count} reduceMotion={false} />,
    );

    expect(container.querySelectorAll("img")).toHaveLength(count + 2);
    expect(container.querySelectorAll(".grayscale")).toHaveLength(1);
  });

  it("보탠 친구가 없으면 조각 없이 회색·컬러 사진만 그린다", () => {
    const { container } = render(
      <FundingResultWishPhoto productImage={SRC} sliceCount={0} reduceMotion={false} />,
    );

    expect(container.querySelectorAll("img")).toHaveLength(2);
  });

  it("모션 감소 설정이면 컬러 사진 한 장만 그린다", () => {
    const { container } = render(
      <FundingResultWishPhoto productImage={SRC} sliceCount={8} reduceMotion />,
    );

    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(container.querySelector(".grayscale")).toBeNull();
  });

  it("상품 이미지가 없으면 이미지 없이 빈 배경만 그린다", () => {
    const { container } = render(<FundingResultWishPhoto sliceCount={8} reduceMotion />);

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".bg-semantic-fill-neutral-weak")).not.toBeNull();
  });
});
