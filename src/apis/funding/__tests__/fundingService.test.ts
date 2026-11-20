import { clientApi, reissue } from "@/apis/client";
import { fundingService } from "@/apis/funding/fundingService";
import { useAuthStore } from "@/store/authStore";
import { ApiError, REISSUE_UNAVAILABLE } from "@/types/api";
import type { CreateFundingRequest, CreateSurpriseFundingRequest } from "@/types/funding/funding";
import type { FundingResultResponse } from "@/types/funding/fundingResult";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
  reissue: vi.fn(),
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

describe("fundingService.getFundingManagement", () => {
  it("clientApi.get을 펀딩 id가 들어간 management 경로로 호출하고 반환값을 그대로 돌려준다", async () => {
    const management = { fundingId: 12, deadline: "2026-11-30T23:59:59.999999" };
    vi.mocked(clientApi.get).mockResolvedValue(management);

    await expect(fundingService.getFundingManagement(12)).resolves.toEqual(management);
    expect(clientApi.get).toHaveBeenCalledWith("/api/fundings/12/management");
  });

  it("clientApi.get이 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("관리 상세 조회 실패");
    vi.mocked(clientApi.get).mockRejectedValue(error);

    await expect(fundingService.getFundingManagement(12)).rejects.toBe(error);
  });
});

describe("fundingService.openResult", () => {
  it("clientApi.post를 펀딩 id가 들어간 result/open 경로로 호출하고 반환값을 그대로 돌려준다", async () => {
    const opened = { ...mockResult, resultOpenedAt: "2026-11-15T00:00:00" };
    vi.mocked(clientApi.post).mockResolvedValue(opened);

    await expect(fundingService.openResult(12)).resolves.toEqual(opened);
    expect(clientApi.post).toHaveBeenCalledWith("/api/fundings/12/result/open", undefined, {
      searchParams: { excludePendingContributions: false },
    });
  });

  it("clientApi.post가 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("팡 열기 실패");
    vi.mocked(clientApi.post).mockRejectedValue(error);

    await expect(fundingService.openResult(12)).rejects.toBe(error);
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

describe("fundingService.changeFundingProduct", () => {
  it("clientApi.patch를 product 경로와 위시 id로 호출한다", async () => {
    vi.mocked(clientApi.patch).mockResolvedValue(null);

    await fundingService.changeFundingProduct(12, { wishId: 3 });

    expect(clientApi.patch).toHaveBeenCalledWith("/api/fundings/12/product", { wishId: 3 });
  });
});

describe("fundingService.extendFunding", () => {
  it("clientApi.post를 extension 경로와 새 마감일로 호출한다", async () => {
    vi.mocked(clientApi.post).mockResolvedValue(null);

    await fundingService.extendFunding(12, { newDeadline: "2026-11-30" });

    expect(clientApi.post).toHaveBeenCalledWith("/api/fundings/12/extension", {
      newDeadline: "2026-11-30",
    });
  });
});

describe("fundingService.postSurpriseFunding", () => {
  const body: CreateSurpriseFundingRequest = {
    recipientId: 3,
    wishId: 9,
    bank: "TOSS_BANK",
    accountNumber: "100159014821",
    targetAmount: 350000,
    deadline: "2026-11-30",
    revealAt: "2026-12-01T00:00:00",
    showOnRecipientProfile: true,
  };

  it("clientApi.post를 /api/fundings/surprise로 body와 함께 호출하고 반환값을 그대로 돌려준다", async () => {
    const created = { fundingId: 8, type: "SURPRISE", status: "FUNDING", shareUrl: "https://x/8" };
    vi.mocked(clientApi.post).mockResolvedValue(created);

    await expect(fundingService.postSurpriseFunding(body)).resolves.toEqual(created);
    expect(clientApi.post).toHaveBeenCalledWith("/api/fundings/surprise", body);
  });

  it("clientApi.post가 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("서프라이즈 개설 실패");
    vi.mocked(clientApi.post).mockRejectedValue(error);

    await expect(fundingService.postSurpriseFunding(body)).rejects.toBe(error);
  });
});

describe("fundingService.getFundingDetailAsMember", () => {
  afterEach(() => useAuthStore.getState().clearAccessToken());

  it("메모리 토큰이 없으면 재발급해 토큰을 저장한 뒤 상세를 조회한다", async () => {
    vi.mocked(reissue).mockResolvedValue({ accessToken: "new-token" });
    vi.mocked(clientApi.get).mockResolvedValue({ fundingId: 12 });

    await expect(fundingService.getFundingDetailAsMember(12)).resolves.toEqual({ fundingId: 12 });

    expect(reissue).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBe("new-token");
    expect(clientApi.get).toHaveBeenCalledWith("/api/fundings/12");
  });

  it("메모리 토큰이 있으면 재발급 없이 바로 조회한다", async () => {
    useAuthStore.getState().setAccessToken("token");
    vi.mocked(clientApi.get).mockResolvedValue({ fundingId: 12 });

    await fundingService.getFundingDetailAsMember(12);

    expect(reissue).not.toHaveBeenCalled();
    expect(clientApi.get).toHaveBeenCalledWith("/api/fundings/12");
  });

  it("refreshToken이 거부돼 재발급이 실패하면 비로그인으로 상세를 조회한다", async () => {
    vi.mocked(reissue).mockRejectedValue(new ApiError("REISSUE_FAILED", "재발급 실패"));
    vi.mocked(clientApi.get).mockResolvedValue({ fundingId: 12 });

    await expect(fundingService.getFundingDetailAsMember(12)).resolves.toEqual({ fundingId: 12 });

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(clientApi.get).toHaveBeenCalledWith("/api/fundings/12");
  });

  it("재발급이 일시 장애로 실패하면 조회하지 않고 에러를 전파한다", async () => {
    const error = new ApiError(REISSUE_UNAVAILABLE, "일시 장애");
    vi.mocked(reissue).mockRejectedValue(error);

    await expect(fundingService.getFundingDetailAsMember(12)).rejects.toBe(error);
    expect(clientApi.get).not.toHaveBeenCalled();
  });
});
