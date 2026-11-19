import { setupServer } from "msw/node";

import type { FriendListResponse, FriendProfileResponse } from "@/types/friend/friend";

import { friendHandlers } from "../friendService.msw";

const BASE_URL = "http://localhost/api/friends";

const server = setupServer(...friendHandlers);

beforeAll(() => server.listen());
afterAll(() => server.close());

const getProfile = async (friendId: number) => {
  const response = await fetch(`${BASE_URL}/${friendId}/profile`);
  return { status: response.status, body: await response.json() };
};

describe("friendHandlers - GET /api/friends", () => {
  it("전체 친구 수와 생일이 다가오는 친구 목록을 응답한다", async () => {
    const response = await fetch(BASE_URL);
    const { data } = (await response.json()) as { data: FriendListResponse };

    expect(data.totalCount).toBe(6);
    expect(data.friends).toHaveLength(6);
    expect(data.upcomingBirthdayFriends).toHaveLength(4);
  });

  it("곧 생일인 친구 중 민지는 펀딩 중, 서준은 서프라이즈 펀딩 중으로 응답한다", async () => {
    const response = await fetch(BASE_URL);
    const { data } = (await response.json()) as { data: FriendListResponse };
    const statusOf = (name: string) =>
      data.upcomingBirthdayFriends.find(friend => friend.name === name)?.fundingStatus;

    expect(statusOf("민지")).toBe("FUNDING");
    expect(statusOf("서준")).toBe("SURPRISE_FUNDING");
  });
});

describe("friendHandlers - GET /api/friends/:friendId/profile", () => {
  it("펀딩·위시가 모두 있는 친구는 펀딩 5개(첫 번째만 서프라이즈)와 위시 2개를 응답한다", async () => {
    const { status, body } = await getProfile(2);
    const data = body.data as FriendProfileResponse;

    expect(status).toBe(200);
    expect(data.name).toBe("민지");
    expect(data.fundings).toHaveLength(5);
    expect(data.fundings.map(funding => funding.type)).toEqual([
      "SURPRISE",
      "BIRTHDAY",
      "BIRTHDAY",
      "BIRTHDAY",
      "BIRTHDAY",
    ]);
    expect(data.wishes).toHaveLength(2);
    expect(data.wishCount).toBe(2);
    expect(data.wishesVisible).toBe(true);
  });

  it("펀딩·위시가 모두 없는 친구는 빈 배열을 응답한다", async () => {
    const { body } = await getProfile(5);

    expect(body.data.fundings).toEqual([]);
    expect(body.data.wishes).toEqual([]);
  });

  it("목록에 없는 친구는 404와 FRIEND_NOT_FOUND 에러를 응답한다", async () => {
    const { status, body } = await getProfile(999);

    expect(status).toBe(404);
    expect(body).toMatchObject({ success: false, data: null, error: { code: "FRIEND_NOT_FOUND" } });
  });
});

describe("friendHandlers - GET /api/friends/:friendId/wishes/:wishId", () => {
  const getWish = async (friendId: number, wishId: number) => {
    const response = await fetch(`${BASE_URL}/${friendId}/wishes/${wishId}`);
    return { status: response.status, body: await response.json() };
  };

  it("프로필 위시 목록에 있는 위시는 판매처·상품 링크를 포함해 응답한다", async () => {
    const { body: profileBody } = await getProfile(2);
    const [wish] = (profileBody.data as FriendProfileResponse).wishes;

    const { status, body } = await getWish(2, wish.wishId);

    expect(status).toBe(200);
    expect(body.data).toMatchObject({
      wishId: wish.wishId,
      productName: wish.productName,
      price: wish.price,
      activeSurpriseFundingId: null,
    });
    expect(body.data.sellerName).toEqual(expect.any(String));
    expect(body.data.productUrl).toMatch(/^https?:\/\//);
  });

  it("친구의 위시가 아니면 404와 FRIEND_002 에러를 응답한다", async () => {
    const { status, body } = await getWish(5, 201);

    expect(status).toBe(404);
    expect(body).toMatchObject({ success: false, data: null, error: { code: "FRIEND_002" } });
  });
});

describe("friendHandlers - GET /api/friends/:userId/public", () => {
  const getPublicProfile = async (userId: number) => {
    const response = await fetch(`${BASE_URL}/${userId}/public`);
    return { status: response.status, body: await response.json() };
  };

  it("위시 목록 없이 위시 개수만 응답한다", async () => {
    const { body } = await getPublicProfile(2);

    expect(body.data.wishCount).toBe(2);
    expect(body.data).not.toHaveProperty("wishes");
    expect(body.data.fundings).toHaveLength(5);
  });

  it("목록에 없는 사용자는 404와 USER_NOT_FOUND 에러를 응답한다", async () => {
    const { status, body } = await getPublicProfile(999);

    expect(status).toBe(404);
    expect(body).toMatchObject({ success: false, data: null, error: { code: "USER_NOT_FOUND" } });
  });
});
