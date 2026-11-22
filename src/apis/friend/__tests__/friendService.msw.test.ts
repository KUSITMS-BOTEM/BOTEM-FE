import { setupServer } from "msw/node";

import type { FriendListResponse, FriendProfileResponse } from "@/types/friend/friend";

import { friendHandlers } from "../friendService.msw";

const BASE_URL = "http://localhost/api/friends";

const server = setupServer(...friendHandlers);

beforeAll(() => server.listen());
afterAll(() => server.close());

const getJson = async (url: string) => {
  const response = await fetch(url);
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
    const friendOf = (name: string) =>
      data.upcomingBirthdayFriends.find(friend => friend.name === name);

    expect(friendOf("민지")).toMatchObject({
      fundingInProgress: true,
      surpriseFundingInProgress: false,
    });
    expect(friendOf("서준")).toMatchObject({
      fundingInProgress: false,
      surpriseFundingInProgress: true,
    });
  });
});

describe("friendHandlers - GET /api/friends/:friendId/profile", () => {
  it("펀딩·위시가 모두 있는 친구는 펀딩 5개(첫 번째만 서프라이즈)와 위시 2개를 응답한다", async () => {
    const { status, body } = await getJson(`${BASE_URL}/2/profile`);
    const data = body.data as FriendProfileResponse;

    expect(status).toBe(200);
    expect(data.name).toBe("민지");
    expect(data.fundings.map(funding => funding.type)).toEqual([
      "SURPRISE",
      "BIRTHDAY",
      "BIRTHDAY",
      "BIRTHDAY",
      "BIRTHDAY",
    ]);
    expect(data.wishesVisible).toBe(true);
    expect(data.wishCount).toBe(2);
    expect(data.wishes).toHaveLength(2);
  });

  it("펀딩·위시가 모두 없는 친구는 빈 배열을 응답한다", async () => {
    const { body } = await getJson(`${BASE_URL}/5/profile`);

    expect(body.data.fundings).toEqual([]);
    expect(body.data.wishes).toEqual([]);
  });

  it("목록에 없는 친구는 404와 FRIEND_002 에러를 응답한다", async () => {
    const { status, body } = await getJson(`${BASE_URL}/999/profile`);

    expect(status).toBe(404);
    expect(body).toMatchObject({ success: false, data: null, error: { code: "FRIEND_002" } });
  });
});

describe("friendHandlers - GET /api/friends/:friendId/wishes/:wishId", () => {
  it("친구 프로필에 있는 위시면 판매처·상품 링크를 포함한 상세를 응답한다", async () => {
    const { body: profileBody } = await getJson(`${BASE_URL}/2/profile`);
    const wishId = (profileBody.data as FriendProfileResponse).wishes[0].wishId;

    const { status, body } = await getJson(`${BASE_URL}/2/wishes/${wishId}`);

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ wishId, activeSurpriseFundingId: null });
    expect(body.data.sellerName).toEqual(expect.any(String));
  });

  it("없는 위시는 404를 응답한다", async () => {
    const { status } = await getJson(`${BASE_URL}/2/wishes/999`);

    expect(status).toBe(404);
  });
});

describe("friendHandlers - GET /api/wish-profiles/:wishProfileKey", () => {
  it("위시 내용 없이 위시 개수만 응답한다", async () => {
    const { body } = await getJson("http://localhost/api/wish-profiles/2");

    expect(body.data.wishesVisible).toBe(false);
    expect(body.data.wishCount).toBe(2);
    expect(body.data.wishes).toEqual([]);
    expect(body.data.fundings).toHaveLength(5);
  });

  it("없는 위시 프로필은 404와 FRIEND_003 에러를 응답한다", async () => {
    const { status, body } = await getJson("http://localhost/api/wish-profiles/999");

    expect(status).toBe(404);
    expect(body).toMatchObject({ success: false, data: null, error: { code: "FRIEND_003" } });
  });
});
