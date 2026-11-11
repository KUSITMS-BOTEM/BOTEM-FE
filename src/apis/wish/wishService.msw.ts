import { delay, http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";

import { MOCK_RECOMMENDED_PRODUCTS } from "@/mocks/mockRecommendedProducts";

const MOCK_WISH_STATUSES = ["AVAILABLE", "FUNDING", "AVAILABLE", "DISCONTINUED", "AVAILABLE"];

export const wishHandlers = [
  http.get("*/api/wishes", async () => {
    await delay(1000);
    const content = MOCK_RECOMMENDED_PRODUCTS.slice(0, MOCK_WISH_STATUSES.length).map(
      (product, index) => ({
        id: product.id,
        productName: product.name,
        productImageUrl: product.imageUrl,
        price: product.price,
        productUrl: "https://link.coupang.com/a/example",
        status: MOCK_WISH_STATUSES[index],
        fundingId: MOCK_WISH_STATUSES[index] === "FUNDING" ? 1 : null,
      }),
    );
    return HttpResponse.json({
      success: true,
      data: { content, page: 0, size: 10, totalElements: content.length, hasNext: false },
      error: null,
    });
  }),
  http.get("*/api/wishes/:wishId", async () => {
    // 스켈레톤 UI를 눈으로 확인할 수 있게 지연을 둔다
    await delay(1000);
    return HttpResponse.json({
      success: true,
      data: {
        id: 1,
        productName: "에어팟 프로 3",
        productImageUrl: faker.image.urlPicsumPhotos({ width: 720, height: 720, blur: 0 }),
        price: 350000,
        productUrl: "https://link.coupang.com/a/example",
        status: "AVAILABLE",
        fundingId: null,
      },
      error: null,
    });
  }),
  // 다이얼로그의 로딩 상태를 눈으로 확인할 수 있게 지연을 둔다
  http.delete("*/api/wishes/:wishId", async () => {
    await delay(1000);
    return HttpResponse.json({ success: true, data: null, error: null });
  }),
  // 다이얼로그의 로딩 상태를 눈으로 확인할 수 있게 지연을 둔다
  http.post("*/api/wishes", async ({ request }) => {
    await delay(1000);
    const { recommendedProductId } = (await request.json()) as { recommendedProductId: number };
    const product = MOCK_RECOMMENDED_PRODUCTS.find(item => item.id === recommendedProductId);

    return HttpResponse.json({
      success: true,
      data: {
        id: recommendedProductId,
        productName: product?.name ?? "",
        productImageUrl: product?.imageUrl ?? "",
        price: product?.price ?? 0,
        productUrl: "https://link.coupang.com/a/example",
        status: "AVAILABLE",
        fundingId: null,
      },
      error: null,
    });
  }),
];
