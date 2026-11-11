import { clientApi } from "@/apis/client";
import { homeService } from "@/apis/home/homeService";
import type { HomeFundingListResponse, HomeNoFundingResponse } from "@/types/home/home";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
  },
}));

const mockFundingList: HomeFundingListResponse = {
  fundingCards: [],
  activeFundingCount: 0,
  canOpenFunding: true,
};

const mockNoFunding: HomeNoFundingResponse = {
  state: "EMPTY",
  nickname: "지유",
  birthdayDday: null,
  wishes: { content: [], page: 0, size: 10, totalElements: 0, hasNext: false },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("homeService.getFundings", () => {
  it("clientApi.get을 /api/home/fundings 경로로 호출하고 반환값을 그대로 돌려준다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockFundingList);

    await expect(homeService.getFundings()).resolves.toEqual(mockFundingList);
    expect(clientApi.get).toHaveBeenCalledWith("/api/home/fundings");
  });

  it("clientApi.get이 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("홈 펀딩 조회 실패");
    vi.mocked(clientApi.get).mockRejectedValue(error);

    await expect(homeService.getFundings()).rejects.toBe(error);
  });
});

describe("homeService.getNoFunding", () => {
  it("clientApi.get을 /api/home/no-funding 경로로 호출하고 반환값을 그대로 돌려준다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockNoFunding);

    await expect(homeService.getNoFunding()).resolves.toEqual(mockNoFunding);
    expect(clientApi.get).toHaveBeenCalledWith("/api/home/no-funding");
  });

  it("clientApi.get이 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("펀딩 없는 홈 조회 실패");
    vi.mocked(clientApi.get).mockRejectedValue(error);

    await expect(homeService.getNoFunding()).rejects.toBe(error);
  });
});
