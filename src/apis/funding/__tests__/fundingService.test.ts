import { clientApi } from "@/apis/client";
import { fundingService } from "@/apis/funding/fundingService";
import type { CreateFundingRequest, FundingRevealResponse } from "@/types/funding/funding";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
    post: vi.fn(),
  },
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
