import { clientApi } from "@/apis/client";
import { userService } from "@/apis/user/userService";
import type { MyProfile } from "@/types/user/profile";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
  },
}));

const mockProfile: MyProfile = {
  nickname: "보탬이",
  profileImageUrl: "https://example.com/profile.png",
  birthday: "2000-01-01",
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
