import { clientApi } from "@/apis/client";
import { contributionService } from "@/apis/contribution/contributionService";
import type { PendingContributionListResponse } from "@/types/contribution/contribution";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockList: PendingContributionListResponse = {
  pendingContributionCount: 1,
  contributions: [
    {
      contributionId: 1,
      participantName: "하린",
      profileImageUrl: null,
      participatedAt: "2026-11-20T14:03:12",
      amount: 30000,
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("contributionService.getPendingContributions", () => {
  it("clientApi.get을 펀딩 id가 들어간 pending 경로로 호출하고 반환값을 그대로 돌려준다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockList);

    await expect(contributionService.getPendingContributions(7)).resolves.toEqual(mockList);
    expect(clientApi.get).toHaveBeenCalledWith("/api/fundings/7/contributions/pending");
  });

  it("clientApi.get이 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("미확인 보탬 조회 실패");
    vi.mocked(clientApi.get).mockRejectedValue(error);

    await expect(contributionService.getPendingContributions(7)).rejects.toBe(error);
  });
});

const progress = {
  confirmedPercentage: 55,
  pendingPercentage: 15,
  pendingContributionCount: 1,
  targetReached: false,
};

describe("contributionService 입금 확인 API", () => {
  const response = {
    contributions: [{ contributionId: 31, status: "CONFIRMED" as const, changed: true }],
    progress,
  };

  it("decideContributions는 decisions 경로로 선택한 참여와 처리 결과를 보내고 응답을 돌려준다", async () => {
    vi.mocked(clientApi.post).mockResolvedValue(response);
    const body = { contributionIds: [31, 32], decision: "CONFIRM" as const };

    await expect(contributionService.decideContributions(7, body)).resolves.toEqual(response);
    expect(clientApi.post).toHaveBeenCalledWith("/api/fundings/7/contributions/decisions", body);
  });

  it("undoContributionDecisions는 decisions/undo 경로로 되돌릴 참여를 보내고 응답을 돌려준다", async () => {
    vi.mocked(clientApi.post).mockResolvedValue(response);
    const body = { contributionIds: [31] };

    await expect(contributionService.undoContributionDecisions(7, body)).resolves.toEqual(response);
    expect(clientApi.post).toHaveBeenCalledWith(
      "/api/fundings/7/contributions/decisions/undo",
      body,
    );
  });

  it("clientApi.post가 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("입금 확인 실패");
    vi.mocked(clientApi.post).mockRejectedValue(error);

    await expect(
      contributionService.decideContributions(7, { contributionIds: [31], decision: "REJECT" }),
    ).rejects.toBe(error);
  });
});
