import { setupServer } from "msw/node";

import { homeHandlers } from "../homeService.msw";

describe("homeHandlers", () => {
  const server = setupServer(...homeHandlers);

  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it("GET /api/home/fundings는 Swagger 스키마의 카드와 진행 중 펀딩 수를 반환한다", async () => {
    const response = await fetch("http://localhost/api/home/fundings");
    const body = await response.json();
    const cardTypes: string[] = body.data.fundingCards.map(
      (card: { cardType: string }) => card.cardType,
    );

    expect(body.success).toBe(true);
    expect(cardTypes.length).toBeGreaterThan(0);
    expect(cardTypes.every(type => ["IN_PROGRESS", "CLOSED_UNOPENED"].includes(type))).toBe(true);
    expect(body.data.activeFundingCount).toBe(
      cardTypes.filter(type => type === "IN_PROGRESS").length,
    );
    body.data.fundingCards.forEach((card: Record<string, unknown>) => {
      expect(card).not.toHaveProperty("targetAmount");
      expect(card).not.toHaveProperty("participantCount");
    });
  });

  it("펀딩이 있는 기본 시나리오에서 GET /api/home/no-funding은 409와 HOME_001을 반환한다", async () => {
    const response = await fetch("http://localhost/api/home/no-funding");
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("HOME_001");
  });
});
