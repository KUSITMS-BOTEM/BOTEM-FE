import { clientApi } from "@/apis/client";
import { fundingService } from "@/apis/funding/fundingService";
import type { CreateFundingRequest, FundingResultResponse } from "@/types/funding/funding";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockResult: FundingResultResponse = {
  fundingId: 12,
  productName: "소니 WH-1000XM5",
  productImageUrl: "https://image.example.com/product.jpg",
  targetAmount: 364000,
  confirmedAmount: 215000,
  achievementPercentage: 59,
  targetReached: false,
  participantCount: 2,
  messageCount: 2,
  pendingContributionCount: 0,
  pendingCleanupRequired: false,
  resultOpenedAt: null,
  contributions: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fundingService.getResult", () => {
  it("clientApi.get을 펀딩 id가 들어간 result 경로로 호출하고 반환값을 그대로 돌려준다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockResult);

    await expect(fundingService.getResult(12)).resolves.toEqual(mockResult);
    expect(clientApi.get).toHaveBeenCalledWith("/api/fundings/12/result");
  });

  it("clientApi.get이 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("펀딩 결과 조회 실패");
    vi.mocked(clientApi.get).mockRejectedValue(error);

    await expect(fundingService.getResult(12)).rejects.toBe(error);
  });
});

describe("fundingService.getManagement", () => {
  it("clientApi.get을 펀딩 id가 들어간 management 경로로 호출하고 반환값을 그대로 돌려준다", async () => {
    const management = { fundingId: 12, deadline: "2026-11-30T23:59:59.999999" };
    vi.mocked(clientApi.get).mockResolvedValue(management);

    await expect(fundingService.getManagement(12)).resolves.toEqual(management);
    expect(clientApi.get).toHaveBeenCalledWith("/api/fundings/12/management");
  });

  it("clientApi.get이 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("관리 상세 조회 실패");
    vi.mocked(clientApi.get).mockRejectedValue(error);

    await expect(fundingService.getManagement(12)).rejects.toBe(error);
  });
});

describe("fundingService.postResultOpen", () => {
  it("clientApi.post를 펀딩 id가 들어간 result/open 경로로 호출하고 반환값을 그대로 돌려준다", async () => {
    const opened = { ...mockResult, resultOpenedAt: "2026-11-15T00:00:00" };
    vi.mocked(clientApi.post).mockResolvedValue(opened);

    await expect(fundingService.postResultOpen(12)).resolves.toEqual(opened);
    expect(clientApi.post).toHaveBeenCalledWith("/api/fundings/12/result/open");
  });

  it("clientApi.post가 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("팡 열기 실패");
    vi.mocked(clientApi.post).mockRejectedValue(error);

    await expect(fundingService.postResultOpen(12)).rejects.toBe(error);
  });
});

describe("fundingService.postFunding", () => {
  const body: CreateFundingRequest = {
    wishId: 1,
    bank: "TOSS_BANK",
    accountNumber: "100159014821",
    targetAmount: 350000,
    deadline: "2026-11-30",
    story: "생일 선물",
  };

  it("clientApi.post를 /api/fundings로 body와 함께 호출하고 반환값을 그대로 돌려준다", async () => {
    const created = { fundingId: 7, type: "BIRTHDAY", status: "FUNDING", shareUrl: "https://x/7" };
    vi.mocked(clientApi.post).mockResolvedValue(created);

    await expect(fundingService.postFunding(body)).resolves.toEqual(created);
    expect(clientApi.post).toHaveBeenCalledWith("/api/fundings", body);
  });

  it("clientApi.post가 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("펀딩 개설 실패");
    vi.mocked(clientApi.post).mockRejectedValue(error);

    await expect(fundingService.postFunding(body)).rejects.toBe(error);
  });
});
