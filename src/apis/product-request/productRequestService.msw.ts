import { delay, http, HttpResponse } from "msw";

export const productRequestHandlers = [
  // 버튼의 로딩 상태를 눈으로 확인할 수 있게 지연을 둔다
  http.post("*/api/product-requests", async () => {
    await delay(800);
    return HttpResponse.json({ success: true, data: null, error: null }, { status: 201 });
  }),
];
