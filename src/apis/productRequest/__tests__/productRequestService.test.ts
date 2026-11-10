import { clientApi } from "@/apis/client";
import { productRequestService } from "@/apis/productRequest/productRequestService";

vi.mock("@/apis/client", () => ({
  clientApi: {
    post: vi.fn(),
  },
}));

const body = { productUrl: "https://www.coupang.com/vp/products/1", productName: "에어팟" };

describe("productRequestService.requestProduct", () => {
  it("clientApi.post를 /api/product-requests 경로와 body로 호출한다", async () => {
    vi.mocked(clientApi.post).mockResolvedValue(null);

    await productRequestService.requestProduct(body);

    expect(clientApi.post).toHaveBeenCalledWith("/api/product-requests", body);
  });

  it("clientApi.post가 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("상품 추가 요청 실패");
    vi.mocked(clientApi.post).mockRejectedValue(error);

    await expect(productRequestService.requestProduct(body)).rejects.toBe(error);
  });
});
