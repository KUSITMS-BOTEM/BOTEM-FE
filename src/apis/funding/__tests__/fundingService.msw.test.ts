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

  it("상품 정보와 구매 링크, 마감 일시를 반환한다", async () => {
    const management = await getManagement(13);

    expect(management.success).toBe(true);
    expect(management.data.product.name).toEqual(expect.any(String));
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

describe("fundingHandlers 상품 변경·기간 연장", () => {
  const send = (method: "PATCH" | "POST", path: string, body: unknown) =>
    fetch(`http://localhost${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  const getManagementOf = (fundingId: number) =>
    fetch(`http://localhost/api/fundings/${fundingId}/management`).then(response =>
      response.json(),
    );

  it("상품을 바꾸면 관리 상세의 상품과 변경 여부에 반영된다", async () => {
    const changed = await (await send("PATCH", "/api/fundings/16/product", { wishId: 1 })).json();
    const management = await getManagementOf(16);

    expect(changed.data.product.name).toBe("에어팟 프로 3");
    expect(management.data.product.name).toBe("에어팟 프로 3");
    expect(management.data.productChanged).toBe(true);
  });

  it("없는 위시로 바꾸면 404(WISH_002)를 돌려준다", async () => {
    const response = await send("PATCH", "/api/fundings/17/product", { wishId: 999 });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("WISH_002");
  });

  it("연장하면 새 마감일이 반영되고 다시 연장할 수 없다", async () => {
    await send("POST", "/api/fundings/12/extension", { newDeadline: "2026-11-30" });
    const management = await getManagementOf(12);

    expect(management.data.deadline.startsWith("2026-11-30")).toBe(true);
    expect(management.data.extended).toBe(true);
    expect(management.data.actions.canExtend).toBe(false);
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

describe("GET management 핸들러", () => {
  const getManagement = async (fundingId: number) => {
    const response = await fetch(`http://localhost/api/fundings/${fundingId}/management`);
    return { status: response.status, body: await response.json() };
  };

  it.each([
    [18, "TARGET_REACHED", 100, 2],
    [17, "IN_PROGRESS", 30, 2],
    [13, "CLOSED", 100, 0],
    [16, "IN_PROGRESS", 10, 0],
    [14, "NO_PARTICIPANTS", 0, 0],
  ])(
    "펀딩 %i는 %s 상태, 확정 %i%%, 확인 대기 %i건으로 응답한다",
    async (fundingId, state, confirmed, pending) => {
      const { body } = await getManagement(fundingId);

      expect(body.data).toMatchObject({
        fundingId,
        managementState: state,
        confirmedPercentage: confirmed,
        pendingContributionCount: pending,
      });
    },
  );

  it("목업에 없는 펀딩은 404 FUNDING_002를 반환한다", async () => {
    const { status, body } = await getManagement(999);

    expect(status).toBe(404);
    expect(body.error.code).toBe("FUNDING_002");
  });
});
