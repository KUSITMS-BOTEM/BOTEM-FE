import { render, screen } from "@testing-library/react";

import SurpriseGiftCoupangGuide from "@/widgets/funding/SurpriseGiftCoupangGuide";

const baseProps = {
  productImageUrl: "https://example.com/gift.png",
  productName: "무선 헤드폰",
  sellerName: "보탬샵" as string | null,
};

describe("SurpriseGiftCoupangGuide", () => {
  it("상품 이미지를 상품명을 alt로 렌더한다", () => {
    render(<SurpriseGiftCoupangGuide {...baseProps} />);

    expect(screen.getByRole("img", { name: "무선 헤드폰" })).toBeInTheDocument();
  });

  it("상품 이미지 URL이 올바르지 않으면 이미지를 렌더하지 않는다", () => {
    render(<SurpriseGiftCoupangGuide {...baseProps} productImageUrl="not-a-url" />);

    expect(screen.queryByRole("img", { name: "무선 헤드폰" })).not.toBeInTheDocument();
  });

  it("판매처 이름이 있으면 판매처와 브랜드샵 문구를 보여준다", () => {
    render(<SurpriseGiftCoupangGuide {...baseProps} sellerName="보탬샵" />);

    expect(screen.getByText("보탬샵")).toBeInTheDocument();
    expect(screen.getByText("브랜드샵")).toBeInTheDocument();
  });

  it("판매처 이름이 null이면 판매처 텍스트를 렌더하지 않는다", () => {
    render(<SurpriseGiftCoupangGuide {...baseProps} sellerName={null} />);

    expect(screen.queryByText("브랜드샵")).not.toBeInTheDocument();
  });

  it("선물 버튼 위치를 알려 주는 안내 캡션을 보여준다", () => {
    render(<SurpriseGiftCoupangGuide {...baseProps} />);

    expect(
      screen.getByText("쿠팡 제품 사진 하단의 선물 버튼을 통해 선물할 수 있어요"),
    ).toBeInTheDocument();
  });
});
