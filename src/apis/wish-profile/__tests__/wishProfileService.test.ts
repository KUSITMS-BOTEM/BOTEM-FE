import { clientApi } from "@/apis/client";
import { wishProfileService } from "@/apis/wish-profile/wishProfileService";
import type { FriendProfileResponse } from "@/types/friend/friend";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
  },
}));

const mockProfile: FriendProfileResponse = {
  userId: 2,
  name: "지유",
  profileImageUrl: null,
  birthday: "10-24",
  birthdayDday: 3,
  fundings: [],
  wishesVisible: false,
  wishCount: 2,
  wishes: [],
};

describe("wishProfileService.getWishProfile", () => {
  it("clientApi.get을 /api/wish-profiles/{wishProfileKey} 경로로 호출한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockProfile);

    await wishProfileService.getWishProfile("8f0c6d77");

    expect(clientApi.get).toHaveBeenCalledWith("/api/wish-profiles/8f0c6d77");
  });

  it("clientApi.get이 돌려준 값을 그대로 반환한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockProfile);

    await expect(wishProfileService.getWishProfile("8f0c6d77")).resolves.toEqual(mockProfile);
  });

  it("clientApi.get이 실패하면 같은 에러로 reject한다", async () => {
    const error = new Error("FRIEND_003");
    vi.mocked(clientApi.get).mockRejectedValue(error);

    await expect(wishProfileService.getWishProfile("8f0c6d77")).rejects.toBe(error);
  });
});
