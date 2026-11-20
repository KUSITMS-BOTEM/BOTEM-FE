import { clientApi, reissue } from "@/apis/client";
import { fundingService } from "@/apis/funding/fundingService";
import { useAuthStore } from "@/store/authStore";
import { ApiError, REISSUE_UNAVAILABLE } from "@/types/api";
import type {
  CreateFundingRequest,
  CreateSurpriseFundingRequest,
  FundingRevealResponse,
} from "@/types/funding/funding";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
    post: vi.fn(),
  },
  reissue: vi.fn(),
}));

const mockReveal: FundingRevealResponse = {
  contributorNames: ["하린이", "도윤이"],
  totalAmount: 215000,
  goalAchieved: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fundingService.getReveal", () => {
  it("clientApi.get을 펀딩 id가 들어간 reveal 경로로 호출하고 반환값을 그대로 돌려준다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockReveal);

    await expect(fundingService.getReveal(12)).resolves.toEqual(mockReveal);
    expect(clientApi.get).toHaveBeenCalledWith("/api/fundings/12/reveal");
  });

  it("clientApi.get이 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("펀딩 공개 조회 실패");
    vi.mocked(clientApi.get).mockRejectedValue(error);

    await expect(fundingService.getReveal(12)).rejects.toBe(error);
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
