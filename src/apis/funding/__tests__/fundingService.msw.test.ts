import { setupServer } from "msw/node";

import { fundingHandlers } from "@/apis/funding/fundingService.msw";

const server = setupServer(...fundingHandlers);

beforeAll(() => server.listen());
afterAll(() => server.close());

const getResult = async (fundingId: number | string) => {
  const response = await fetch(`http://localhost/api/fundings/${fundingId}/result`);
  return response.json();
};

describe("fundingHandlers GET /result", () => {
  it("펀딩 12는 5명이 보탠 목표 미달성(100% 미만) 결과를 반환한다", async () => {
    const body = await getResult(12);

    expect(body.data.participantCount).toBe(5);
    expect(body.data.contributions).toHaveLength(5);
    expect(body.data.confirmedAmount).toBe(215000);
    expect(body.data.achievementPercentage).toBeLessThan(100);
    expect(body.data.resultOpenedAt).toBeNull();
  });

  it("펀딩 13은 8명이 보탠 목표 달성(100% 이상) 결과를 반환한다", async () => {
    const body = await getResult(13);

    expect(body.data.participantCount).toBe(8);
    expect(body.data.confirmedAmount).toBe(429000);
    expect(body.data.achievementPercentage).toBeGreaterThanOrEqual(100);
    expect(body.data.targetReached).toBe(true);
  });

  it("목록에 없는 펀딩 id는 참여자 0명의 빈 결과를 반환한다", async () => {
    const body = await getResult(999);

    expect(body.data.fundingId).toBe(999);
    expect(body.data.participantCount).toBe(0);
    expect(body.data.messageCount).toBe(0);
    expect(body.data.contributions).toEqual([]);
  });

  it("응답이 success true, error null인 ApiResponse 형태다", async () => {
    const body = await getResult(12);

    expect(body.success).toBe(true);
    expect(body.error).toBeNull();
  });
});

describe("fundingHandlers POST /result/open", () => {
  it("조회와 같은 결과에 열람 시각을 채워 반환한다", async () => {
    const response = await fetch("http://localhost/api/fundings/13/result/open", {
      method: "POST",
    });
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.fundingId).toBe(13);
    expect(body.data.participantCount).toBe(8);
    expect(body.data.resultOpenedAt).not.toBeNull();
  });
});

describe("fundingHandlers GET /management", () => {
  const getManagement = async (fundingId: number) => {
    const response = await fetch(`http://localhost/api/fundings/${fundingId}/management`);
    return response.json();
  };

  it("결과 mock과 같은 상품 정보와 구매 링크를 반환한다", async () => {
    const [management, result] = await Promise.all([getManagement(13), getResult(13)]);

    expect(management.success).toBe(true);
    expect(management.data.product.name).toBe(result.data.productName);
    expect(management.data.product.url).toMatch(/^https:\/\//);
    expect(management.data.deadline).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("목표에 못 미친 펀딩만 연장할 수 있다", async () => {
    const [underTarget, reached] = await Promise.all([getManagement(12), getManagement(13)]);

    expect(underTarget.data.actions.canExtend).toBe(true);
    expect(reached.data.actions.canExtend).toBe(false);
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
