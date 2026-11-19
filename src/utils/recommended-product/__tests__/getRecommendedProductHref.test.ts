import { getRecommendedProductHref } from "@/utils/recommended-product/getRecommendedProductHref";

describe("getRecommendedProductHref", () => {
  it("위시에 담지 않았으면 추천 상품 상세 경로를 돌려준다", () => {
    expect(getRecommendedProductHref({ id: 3, wishId: null })).toBe("/wish/recommended/3");
  });

  it("위시에 담은 상품이면(펀딩 중 포함) 위시 상세 경로를 돌려준다", () => {
    expect(getRecommendedProductHref({ id: 3, wishId: 8 })).toBe("/wish/8");
  });
});
