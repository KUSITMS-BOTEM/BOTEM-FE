import { clientApi } from "@/apis/client";
import { recommendedProductService } from "@/apis/recommended-product/recommendedProductService";
import type { RecommendedProductResponse } from "@/types/recommended-product/recommendedProduct";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
  },
}));

const mockRecommendedProducts: RecommendedProductResponse[] = [
  {
    id: 1,
    name: "에어팟 프로",
    imageUrl: "https://example.com/airpods.png",
    price: 359000,
    sellerName: "애플",
    category: "EARPHONE_HEADPHONE",
    status: "ON_SALE",
  },
];

describe("recommendedProductService.getRecommendedProducts", () => {
  it("category 인자 없이 호출하면 clientApi.get을 두 번째 인자 undefined로 호출한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockRecommendedProducts);

    await recommendedProductService.getRecommendedProducts();

    expect(clientApi.get).toHaveBeenCalledWith("/api/recommended-products", undefined);
  });

  it("category 인자를 주면 clientApi.get을 { category } 객체로 호출한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockRecommendedProducts);

    await recommendedProductService.getRecommendedProducts("EARPHONE_HEADPHONE");

    expect(clientApi.get).toHaveBeenCalledWith("/api/recommended-products", {
      category: "EARPHONE_HEADPHONE",
    });
  });

  it("clientApi.get이 반환한 값을 그대로 반환한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockRecommendedProducts);

    await expect(recommendedProductService.getRecommendedProducts()).resolves.toEqual(
      mockRecommendedProducts,
    );
  });

  it("clientApi.get이 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("추천 상품 조회 실패");
    vi.mocked(clientApi.get).mockRejectedValue(error);

    await expect(recommendedProductService.getRecommendedProducts()).rejects.toBe(error);
  });
});
