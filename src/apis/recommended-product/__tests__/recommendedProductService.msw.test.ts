import { setupServer } from "msw/node";

import { MOCK_RECOMMENDED_PRODUCTS } from "@/mocks/mockRecommendedProducts";

import { recommendedProductHandlers } from "../recommendedProductService.msw";

const BASE_URL = "http://localhost/api/recommended-products";

describe("recommendedProductHandlers", () => {
  const server = setupServer(...recommendedProductHandlers);

  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it("category 없이 목록을 요청하면 전체 추천 상품을 반환한다", async () => {
    const response = await fetch(BASE_URL);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(MOCK_RECOMMENDED_PRODUCTS.length);
  });

  it("category를 지정하면 해당 카테고리의 상품만 반환한다", async () => {
    const response = await fetch(`${BASE_URL}?category=PERFUME`);
    const body = await response.json();

    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.every((product: { category: string }) => product.category === "PERFUME")).toBe(
      true,
    );
  });

  it("존재하지 않는 category면 빈 배열을 반환한다", async () => {
    const response = await fetch(`${BASE_URL}?category=NOT_EXISTS`);
    const body = await response.json();

    expect(body.data).toEqual([]);
  });

  it("존재하는 productId로 상세를 요청하면 해당 상품을 반환한다", async () => {
    const response = await fetch(`${BASE_URL}/1`);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.id).toBe(1);
  });

  it("존재하지 않는 productId로 상세를 요청하면 PRODUCT_001 에러를 반환한다", async () => {
    const response = await fetch(`${BASE_URL}/9999`);
    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error.code).toBe("PRODUCT_001");
  });
});
