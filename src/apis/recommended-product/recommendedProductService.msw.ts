import { delay, http, HttpResponse } from "msw";

import { MOCK_RECOMMENDED_PRODUCTS } from "@/mocks/mockRecommendedProducts";

export const recommendedProductHandlers = [
  http.get("*/api/recommended-products", async ({ request }) => {
    // 스켈레톤 UI를 눈으로 확인할 수 있게 지연을 둔다
    await delay(1000);
    const category = new URL(request.url).searchParams.get("category");
    const data = category
      ? MOCK_RECOMMENDED_PRODUCTS.filter(product => product.category === category)
      : MOCK_RECOMMENDED_PRODUCTS;

    return HttpResponse.json({ success: true, data, error: null });
  }),
  http.get("*/api/recommended-products/:productId", async ({ params }) => {
    // 스켈레톤 UI를 눈으로 확인할 수 있게 지연을 둔다
    await delay(1000);
    const product = MOCK_RECOMMENDED_PRODUCTS.find(item => item.id === Number(params.productId));
    if (!product) {
      return HttpResponse.json({
        success: false,
        data: null,
        error: { code: "PRODUCT_001", message: "추천 상품을 찾을 수 없습니다." },
      });
    }

    return HttpResponse.json({ success: true, data: product, error: null });
  }),
];
