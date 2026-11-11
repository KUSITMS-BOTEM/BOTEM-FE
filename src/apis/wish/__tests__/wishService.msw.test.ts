import { setupServer } from "msw/node";

import { wishHandlers } from "../wishService.msw";

describe("wishHandlers GET /api/wishes", () => {
  const server = setupServer(...wishHandlers);

  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it("ApiResponse 형태로 위시 페이지를 반환한다", async () => {
    const response = await fetch("http://localhost/api/wishes");
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.content.length).toBeGreaterThan(0);
    expect(body.data.hasNext).toBe(false);
  });

  it("AVAILABLE·FUNDING·DISCONTINUED 상태를 모두 포함한다", async () => {
    const response = await fetch("http://localhost/api/wishes");
    const body = await response.json();
    const statuses = new Set(body.data.content.map((wish: { status: string }) => wish.status));

    expect(statuses).toEqual(new Set(["AVAILABLE", "FUNDING", "DISCONTINUED"]));
  });
});
