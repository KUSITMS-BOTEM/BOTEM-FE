import { delay, http, HttpResponse } from "msw";

import { MOCK_RECOMMENDED_PRODUCTS } from "@/mocks/mockRecommendedProducts";

const MOCK_WISH_STATUSES = ["AVAILABLE", "FUNDING", "AVAILABLE", "DISCONTINUED", "AVAILABLE"];

const MOCK_WISHES = MOCK_RECOMMENDED_PRODUCTS.slice(0, MOCK_WISH_STATUSES.length).map(
  (product, index) => ({
    id: product.id,
    productName: product.name,
    productImageUrl: product.imageUrl,
    price: product.price,
    productUrl: "https://link.coupang.com/a/example",
    sellerName: product.sellerName,
    status: MOCK_WISH_STATUSES[index],
    fundingId: MOCK_WISH_STATUSES[index] === "FUNDING" ? 1 : null,
  }),
);

export const wishHandlers = [
  http.get("*/api/wishes", async ({ request }) => {
    await delay(1000);
    const { searchParams } = new URL(request.url);
    const page = Math.max(0, Number(searchParams.get("page")) || 0);
    const size = Math.max(1, Number(searchParams.get("size")) || 10);
    const wishes = MOCK_WISHES;
    const content = wishes.slice(page * size, (page + 1) * size);
    return HttpResponse.json({
      success: true,
      data: {
        content,
        page,
        size,
        totalElements: wishes.length,
        hasNext: (page + 1) * size < wishes.length,
      },
      error: null,
    });
  }),
  http.get("*/api/wishes/:wishId", async ({ params }) => {
    // 스켈레톤 UI를 눈으로 확인할 수 있게 지연을 둔다
    await delay(1000);
    // 목록과 같은 상태가 나오도록 wishId로 찾고, 목에 없는 id는 첫 위시로 대신한다
    const wish = MOCK_WISHES.find(item => item.id === Number(params.wishId)) ?? MOCK_WISHES[0];
    return HttpResponse.json({ success: true, data: wish, error: null });
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
        sellerName: product?.sellerName ?? "",
        status: "AVAILABLE",
        fundingId: null,
      },
      error: null,
    });
  }),
];
