import { setupServer } from "msw/node";

import type { FriendListResponse, FriendProfileResponse } from "@/types/friend/friend";

import { friendHandlers } from "../friendService.msw";

const BASE_URL = "http://localhost/api/friends";

const server = setupServer(...friendHandlers);

beforeAll(() => server.listen());
afterAll(() => server.close());

const getProfile = async (friendId: number) => {
  const response = await fetch(`${BASE_URL}/${friendId}`);
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
});

describe("friendHandlers - GET /api/friends/:friendId", () => {
  it("펀딩·위시가 모두 있는 친구는 펀딩 5개(첫 번째만 서프라이즈)와 위시 2개를 응답한다", async () => {
    const { status, body } = await getProfile(2);
    const data = body.data as FriendProfileResponse;

    expect(status).toBe(200);
    expect(data.name).toBe("민지");
    expect(data.fundings).toHaveLength(5);
    expect(data.fundings.map(funding => funding.isSurprise)).toEqual([
      true,
      false,
      false,
      false,
      false,
    ]);
    expect(data.wishes).toHaveLength(2);
    expect(data).not.toHaveProperty("wishCount");
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
