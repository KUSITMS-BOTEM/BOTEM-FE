import { clientApi } from "@/apis/client";
import { thankCardService } from "@/apis/thank-card/thankCardService";
import type { ThankCardResponse } from "@/types/thank-card/thankCard";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
  },
}));

const mockThankCard: ThankCardResponse = {
  thankCardId: 15,
  fundingId: 12,
  contributionId: 31,
  senderName: "지유",
  recipientName: "하린",
  productName: "소니 WH-1000XM5",
  productImageUrl: "https://image.example.com/product.jpg",
  message: "덕분에 정말 행복한 생일이 됐어!",
  sentAt: "2026-11-19T20:00:00",
  shareUrl: "https://botem.me/thank-cards/550e8400",
};

describe("thankCardService.getSharedThankCard", () => {
  it("clientApi.get을 /api/thank-cards/{shareKey} 경로로 호출한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockThankCard);

    await thankCardService.getSharedThankCard("550e8400");

    expect(clientApi.get).toHaveBeenCalledWith("/api/thank-cards/550e8400");
  });

  it("clientApi.get이 돌려준 값을 그대로 반환한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockThankCard);

    await expect(thankCardService.getSharedThankCard("550e8400")).resolves.toEqual(mockThankCard);
  });

  it("clientApi.get이 실패하면 같은 에러로 reject한다", async () => {
    const error = new Error("FUNDING_050");
    vi.mocked(clientApi.get).mockRejectedValue(error);

    await expect(thankCardService.getSharedThankCard("550e8400")).rejects.toBe(error);
  });
});
