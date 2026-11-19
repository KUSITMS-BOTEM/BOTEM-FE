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

  it("펀딩 진행 중이면 위시보다 펀딩 경로를 우선한다", () => {
    expect(getRecommendedProductHref({ id: 3, wishId: 8, fundingId: 5 })).toBe("/funding/5");
  });
});
