import { clientApi } from "@/apis/client";
import { friendService } from "@/apis/friend/friendService";
import type { FriendProfileResponse } from "@/types/friend/friend";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
  },
}));

const mockProfile: FriendProfileResponse = {
  userId: 5,
  name: "지유",
  profileImageUrl: null,
  birthday: "10-24",
  birthdayDday: 3,
  fundings: [],
  wishes: [],
};

describe("friendService.getFriends", () => {
  it("clientApi.get을 /api/friends 경로로 호출한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(null);

    await friendService.getFriends();

    expect(clientApi.get).toHaveBeenCalledWith("/api/friends");
  });
});

describe("friendService.getFriendProfile", () => {
  it("clientApi.get을 /api/friends/{friendId} 경로로 호출한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockProfile);

    await friendService.getFriendProfile("5");

    expect(clientApi.get).toHaveBeenCalledWith("/api/friends/5");
  });

  it("clientApi.get이 반환한 값을 그대로 반환한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockProfile);

    await expect(friendService.getFriendProfile("5")).resolves.toEqual(mockProfile);
  });
});
