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

  it("page와 size에 맞춰 다음 위시 페이지를 반환한다", async () => {
    const first = await (await fetch("http://localhost/api/wishes?page=0&size=4")).json();
    const second = await (await fetch("http://localhost/api/wishes?page=1&size=4")).json();

    expect(first.data.content).toHaveLength(4);
    expect(first.data.hasNext).toBe(true);
    expect(second.data.content).toHaveLength(1);
    expect(second.data.page).toBe(1);
    expect(second.data.hasNext).toBe(false);
  });
});
