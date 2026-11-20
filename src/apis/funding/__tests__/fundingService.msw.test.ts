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

describe("fundingHandlers POST /api/fundings", () => {
  it("ApiResponse 형태로 개설된 펀딩의 fundingId·type·status·shareUrl을 반환한다", async () => {
    const response = await fetch("http://localhost/api/fundings", { method: "POST", body: "{}" });
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data).toEqual({
      fundingId: expect.any(Number),
      type: "BIRTHDAY",
      status: "FUNDING",
      shareUrl: expect.any(String),
    });
  });
});

describe("fundingHandlers POST /api/fundings/surprise", () => {
  it("ApiResponse 형태로 SURPRISE 타입의 fundingId·status·shareUrl을 반환한다", async () => {
    const response = await fetch("http://localhost/api/fundings/surprise", {
      method: "POST",
      body: "{}",
    });
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data).toEqual({
      fundingId: expect.any(Number),
      type: "SURPRISE",
      status: "FUNDING",
      shareUrl: expect.any(String),
    });
  });

  describe("펀딩 상세 조회", () => {
    const getDetail = async (fundingId: number, headers?: HeadersInit) => {
      const response = await fetch(`http://localhost/api/fundings/${fundingId}`, { headers });
      return response.json();
    };

    it("요청한 펀딩 id를 돌려주고 토큰이 없으면 ownerPreview는 false다", async () => {
      const body = await getDetail(99);

      expect(body.data.fundingId).toBe(99);
      expect(body.data.ownerPreview).toBe(false);
    });

    it("토큰을 붙인 id 99 조회만 ownerPreview가 true다", async () => {
      const headers = { Authorization: "Bearer token" };

      expect((await getDetail(99, headers)).data.ownerPreview).toBe(true);
      expect((await getDetail(12, headers)).data.ownerPreview).toBe(false);
    });
  });
});
