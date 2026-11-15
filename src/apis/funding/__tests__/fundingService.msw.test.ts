import { setupServer } from "msw/node";

import { fundingHandlers } from "@/apis/funding/fundingService.msw";

const server = setupServer(...fundingHandlers);

beforeAll(() => server.listen());
afterAll(() => server.close());

const getReveal = async (fundingId: number | string) => {
  const response = await fetch(`http://localhost/api/fundings/${fundingId}/reveal`);
  return response.json();
};

describe("fundingHandlers", () => {
  it("펀딩 12는 5명이 보탠 목표 미달성 결과를 반환한다", async () => {
    const body = await getReveal(12);

    expect(body.data.contributorNames).toHaveLength(5);
    expect(body.data.totalAmount).toBe(215000);
    expect(body.data.goalAchieved).toBe(false);
  });

  it("펀딩 13은 8명이 보탠 목표 달성 결과를 반환한다", async () => {
    const body = await getReveal(13);

    expect(body.data.contributorNames).toHaveLength(8);
    expect(body.data.totalAmount).toBe(429000);
    expect(body.data.goalAchieved).toBe(true);
  });

  it("목록에 없는 펀딩 id는 참여자 0명의 빈 결과를 반환한다", async () => {
    const body = await getReveal(999);

    expect(body.data).toEqual({ contributorNames: [], totalAmount: 0, goalAchieved: false });
  });

  it("숫자가 아닌 펀딩 id도 참여자 0명의 빈 결과로 처리한다", async () => {
    const body = await getReveal("abc");

    expect(body.data.contributorNames).toEqual([]);
  });

  it("응답이 success true, error null인 ApiResponse 형태다", async () => {
    const body = await getReveal(12);

    expect(body.success).toBe(true);
    expect(body.error).toBeNull();
  });
});
