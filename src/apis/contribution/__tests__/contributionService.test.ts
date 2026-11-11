import { clientApi } from "@/apis/client";
import { contributionService } from "@/apis/contribution/contributionService";
import type { PendingContributionListResponse } from "@/types/contribution/contribution";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockList: PendingContributionListResponse = {
  contributions: [{ contributionId: 1, senderName: "하린이", depositMethod: "토스뱅크 계좌" }],
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

describe("contributionService.updateContributionStatus", () => {
  it("clientApi.patch를 펀딩 id가 들어간 status 경로와 body로 호출하고 반환값을 그대로 돌려준다", async () => {
    vi.mocked(clientApi.patch).mockResolvedValue(null);
    const body = { contributionIds: [1, 2], status: "CONFIRMED" as const };

    await expect(contributionService.updateContributionStatus(7, body)).resolves.toBeNull();
    expect(clientApi.patch).toHaveBeenCalledWith("/api/fundings/7/contributions/status", body);
  });

  it("clientApi.patch가 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("상태 변경 실패");
    vi.mocked(clientApi.patch).mockRejectedValue(error);

    await expect(
      contributionService.updateContributionStatus(7, { contributionIds: [1], status: "REJECTED" }),
    ).rejects.toBe(error);
  });
});
