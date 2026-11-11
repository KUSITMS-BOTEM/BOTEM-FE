import { setupServer } from "msw/node";

type Server = ReturnType<typeof setupServer>;

const BASE = "http://localhost/api/fundings/1/contributions";

let server: Server;

beforeEach(async () => {
  vi.resetModules();
  const { contributionHandlers } = await import("../contributionService.msw");
  server = setupServer(...contributionHandlers);
  server.listen();
});

afterEach(() => {
  server.close();
});

const getPending = async () => {
  const response = await fetch(`${BASE}/pending`);
  const body = await response.json();
  return body.data.contributions as { contributionId: number }[];
};

const patchStatus = (contributionIds: number[], status: string) =>
  fetch(`${BASE}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contributionIds, status }),
  });

describe("contributionHandlers", () => {
  it("GET pending은 초기 상태에서 ApiResponse 형태로 4건을 모두 반환한다", async () => {
    const response = await fetch(`${BASE}/pending`);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.error).toBeNull();
    expect(body.data.contributions.map((c: { senderName: string }) => c.senderName)).toEqual([
      "하린이",
      "도윤이",
      "서준이",
      "지아",
    ]);
  });

  it("PATCH status는 ApiResponse 형태로 data null을 반환한다", async () => {
    const response = await patchStatus([1], "CONFIRMED");
    const body = await response.json();

    expect(body).toEqual({ success: true, data: null, error: null });
  });

  it("CONFIRMED로 바꾼 보탬은 pending 목록에서 빠지고 나머지는 남는다", async () => {
    await patchStatus([2], "CONFIRMED");

    expect((await getPending()).map(c => c.contributionId)).toEqual([1, 3, 4]);
  });

  it("REJECTED로 바꾼 보탬도 pending 목록에서 빠진다", async () => {
    await patchStatus([3], "REJECTED");

    expect((await getPending()).map(c => c.contributionId)).toEqual([1, 2, 4]);
  });

  it("여러 id를 한 번에 바꾸면 모두 pending 목록에서 빠진다", async () => {
    await patchStatus([1, 4], "CONFIRMED");

    expect((await getPending()).map(c => c.contributionId)).toEqual([2, 3]);
  });

  it("PENDING으로 되돌리면 pending 목록에 다시 나타난다", async () => {
    await patchStatus([1, 2], "CONFIRMED");
    await patchStatus([1], "PENDING");

    expect((await getPending()).map(c => c.contributionId)).toEqual([1, 3, 4]);
  });

  it("모두 처리하면 pending 목록이 빈 배열이다", async () => {
    await patchStatus([1, 2, 3, 4], "CONFIRMED");

    expect(await getPending()).toEqual([]);
  });
});
