import { setupServer } from "msw/node";

import { homeHandlers } from "../homeService.msw";

describe("homeHandlers", () => {
  const server = setupServer(...homeHandlers);

  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it("마감 후 확인 대기가 없으면 GET /api/home/fundings는 open 카드를 반환한다", async () => {
    const response = await fetch("http://localhost/api/home/fundings");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.fundingCards).toEqual([
      expect.objectContaining({
        fundingId: 13,
        cardType: "CLOSED_UNOPENED",
        remainingDays: null,
        pendingContributionCount: 0,
      }),
    ]);
    expect(body.data.activeFundingCount).toBe(0);
    expect(body.data.canOpenFunding).toBe(true);
  });

  it("펀딩이 있으면 GET /api/home/no-funding은 409와 HOME_001을 반환한다", async () => {
    const response = await fetch("http://localhost/api/home/no-funding");
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("HOME_001");
  });
});
