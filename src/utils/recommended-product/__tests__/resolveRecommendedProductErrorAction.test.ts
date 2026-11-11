import { resolveRecommendedProductErrorAction } from "../resolveRecommendedProductErrorAction";
import { ApiError } from "@/types/api";

describe("resolveRecommendedProductErrorAction", () => {
  it("ApiError가 아니면 none을 반환한다", () => {
    expect(resolveRecommendedProductErrorAction(new Error("network"))).toBe("none");
    expect(resolveRecommendedProductErrorAction(null)).toBe("none");
  });

  it("PRODUCT_001이면 notFound를 반환한다", () => {
    expect(resolveRecommendedProductErrorAction(new ApiError("PRODUCT_001", "상품 없음"))).toBe(
      "notFound",
    );
  });

  it("AUTH_로 시작하는 코드면 unauthorized를 반환한다", () => {
    expect(resolveRecommendedProductErrorAction(new ApiError("AUTH_001", "인증 실패"))).toBe(
      "unauthorized",
    );
  });

  it("그 외 코드면 alert를 반환한다", () => {
    expect(resolveRecommendedProductErrorAction(new ApiError("PRODUCT_999", "서버 오류"))).toBe(
      "alert",
    );
  });
});
