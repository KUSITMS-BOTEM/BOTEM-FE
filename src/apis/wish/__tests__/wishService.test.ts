import { clientApi } from "@/apis/client";
import { wishService } from "@/apis/wish/wishService";
import type { WishResponse } from "@/types/wish/wish";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
  },
}));

const mockWish: WishResponse = {
  id: 1,
  productName: "에어팟 프로",
  productImageUrl: "https://example.com/airpods.png",
  price: 359000,
  productUrl: "https://example.com/product/1",
  sellerName: "쿠팡 Apple 공식 브랜드관",
  status: "AVAILABLE",
  fundingId: null,
};

describe("wishService.getWishes", () => {
  it("clientApi.get을 /api/wishes 경로로 호출한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue({ content: [mockWish] });

    await wishService.getWishes();

    expect(clientApi.get).toHaveBeenCalledWith("/api/wishes");
  });
});

describe("wishService.getWish", () => {
  it("clientApi.get을 /api/wishes/{wishId} 경로로 호출한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockWish);

    await wishService.getWish("1");

    expect(clientApi.get).toHaveBeenCalledWith("/api/wishes/1");
  });

  it("clientApi.get이 반환한 값을 그대로 반환한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockWish);

    await expect(wishService.getWish("1")).resolves.toEqual(mockWish);
  });

  it("clientApi.get이 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("위시 조회 실패");
    vi.mocked(clientApi.get).mockRejectedValue(error);

    await expect(wishService.getWish("1")).rejects.toBe(error);
  });
});
