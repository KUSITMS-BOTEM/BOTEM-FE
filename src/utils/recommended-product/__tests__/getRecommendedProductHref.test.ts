import { getRecommendedProductHref } from "@/utils/recommended-product/getRecommendedProductHref";

describe("getRecommendedProductHref", () => {
  it("위시도 펀딩도 없으면 추천 상품 상세 경로를 돌려준다", () => {
    expect(getRecommendedProductHref({ id: 3 })).toBe("/wish/recommended/3");
    expect(getRecommendedProductHref({ id: 3, wishId: null, fundingId: null })).toBe(
      "/wish/recommended/3",
    );
  });

  it("위시에 담은 상품이면 위시 상세 경로를 돌려준다", () => {
    expect(getRecommendedProductHref({ id: 3, wishId: 8, fundingId: null })).toBe("/wish/8");
  });

  it("펀딩 진행 중인 상품도 위시 상세 경로로 보낸다", () => {
    expect(getRecommendedProductHref({ id: 3, wishId: 8, fundingId: 5 })).toBe("/wish/8");
  });
});
