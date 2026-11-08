import { clientApi } from "@/apis/client";
import { userService } from "@/apis/user/userService";
import type { RegisterOnboardingRequest } from "@/types/user/onboarding";
import type { MyProfile } from "@/types/user/profile";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
    post: vi.fn(),
    deleteAuth: vi.fn(),
  },
}));

const mockProfile: MyProfile = {
  nickname: "보탬이",
  profileImageUrl: "https://example.com/profile.png",
  birthday: "01-01",
  wishProfileUrl: "https://example.com/wish",
  kakaoConnected: true,
};

describe("userService.getMyProfile", () => {
  it("clientApi.get을 /api/users/me/profile 경로로 호출한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockProfile);

    await userService.getMyProfile();

    expect(clientApi.get).toHaveBeenCalledWith("/api/users/me/profile");
  });

  it("clientApi.get이 반환한 값을 그대로 반환한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockProfile);

    await expect(userService.getMyProfile()).resolves.toEqual(mockProfile);
  });

  it("clientApi.get이 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("프로필 조회 실패");
    vi.mocked(clientApi.get).mockRejectedValue(error);

    await expect(userService.getMyProfile()).rejects.toBe(error);
  });
});

describe("userService.completeOnboarding", () => {
  const body: RegisterOnboardingRequest = {
    name: "보탬이",
    birthday: "01-01",
    bank: "KB_KOOKMIN",
    accountNumber: "1234567890",
  };

  it("clientApi.post를 온보딩 경로와 body로 호출한다", async () => {
    vi.mocked(clientApi.post).mockResolvedValue(null);

    await userService.completeOnboarding(body);

    expect(clientApi.post).toHaveBeenCalledWith("/api/users/me/onboarding", body);
  });

  it("clientApi.post가 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("온보딩 완료 실패");
    vi.mocked(clientApi.post).mockRejectedValue(error);

    await expect(userService.completeOnboarding(body)).rejects.toBe(error);
  });
});

describe("userService.withdraw", () => {
  it("clientApi.deleteAuth를 /api/users/me 경로로 호출한다", async () => {
    vi.mocked(clientApi.deleteAuth).mockResolvedValue(null);

    await userService.withdraw();

    expect(clientApi.deleteAuth).toHaveBeenCalledWith("/api/users/me");
  });

  it("clientApi.deleteAuth가 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("회원탈퇴 실패");
    vi.mocked(clientApi.deleteAuth).mockRejectedValue(error);

    await expect(userService.withdraw()).rejects.toBe(error);
  });
});
