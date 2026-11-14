import { clientApi } from "@/apis/client";
import { fundingService } from "@/apis/funding/fundingService";
import type { FundingRevealResponse } from "@/types/funding/funding";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
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
