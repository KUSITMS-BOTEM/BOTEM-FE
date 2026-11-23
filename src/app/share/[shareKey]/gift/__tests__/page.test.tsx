import { fundingServerService } from "@/apis/funding/fundingServerService";
import FundingGiftProofPage from "@/app/share/[shareKey]/gift/page";
import { ApiError } from "@/types/api";
import type { FundingDetailResponse } from "@/types/funding/fundingDetail";

vi.mock("@/apis/funding/fundingServerService", () => ({
  fundingServerService: { getFundingDetail: vi.fn() },
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => ({ value: "true" }) }),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));
vi.mock("@/widgets/funding/FundingGiftProofContainer", () => ({ default: () => null }));

const renderPage = (shareKey = "abc") =>
  FundingGiftProofPage({ params: Promise.resolve({ shareKey }) });
const mockFunding = (type: string) =>
  vi
    .mocked(fundingServerService.getFundingDetail)
    .mockResolvedValue({ type } as unknown as FundingDetailResponse);

describe("FundingGiftProofPage", () => {
  it("일반 펀딩이면 인증 결과 화면에 공유 키와 로그인 여부를 넘긴다", async () => {
    mockFunding("BIRTHDAY");

    const element = await renderPage();

    expect(element.props).toEqual({ shareKey: "abc", isLoggedIn: true });
  });

  it("서프라이즈 펀딩이면 공유 화면으로 돌려보낸다", async () => {
    mockFunding("SURPRISE");

    await expect(renderPage()).rejects.toThrow("REDIRECT:/share/abc");
  });

  it("없는 펀딩이면 404로 보낸다", async () => {
    vi.mocked(fundingServerService.getFundingDetail).mockRejectedValue(
      new ApiError("FUNDING_002", "펀딩을 찾을 수 없습니다."),
    );

    await expect(renderPage("missing")).rejects.toThrow("NOT_FOUND");
  });
});
