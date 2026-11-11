import { setupServer } from "msw/node";

type Server = ReturnType<typeof setupServer>;

const BASE = "http://localhost/api/fundings/12/contributions";
const OTHER_BASE = "http://localhost/api/fundings/15/contributions";

let server: Server;

beforeEach(async () => {
  vi.resetModules();
  const { contributionHandlers } = await import("../contributionService.msw");
  const { createHomeHandlers } = await import("@/apis/home/homeService.msw");
  server = setupServer(...contributionHandlers, ...createHomeHandlers("CLOSED_PENDING"));
  server.listen();
});

afterEach(() => {
  server.close();
});

const getPending = async (base = BASE) => {
  const response = await fetch(`${base}/pending`);
  const body = await response.json();
  return body.data.contributions as { contributionId: number }[];
};

const patchStatus = (contributionIds: number[], status: string, base = BASE) =>
  fetch(`${base}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contributionIds, status }),
  });

describe("contributionHandlers", () => {
  it("GET pending은 해당 펀딩의 보탬만 반환한다", async () => {
    const response = await fetch(`${BASE}/pending`);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.error).toBeNull();
    expect(body.data.contributions.map((c: { senderName: string }) => c.senderName)).toEqual([
      "하린이",
      "도윤이",
    ]);
    expect((await getPending(OTHER_BASE)).map(c => c.contributionId)).toEqual([3, 4]);
  });

  it("PATCH status는 ApiResponse 형태로 data null을 반환한다", async () => {
    const response = await patchStatus([1], "CONFIRMED");
    const body = await response.json();

    expect(body).toEqual({ success: true, data: null, error: null });
  });

  it("CONFIRMED로 바꾼 보탬은 pending 목록에서 빠지고 나머지는 남는다", async () => {
    await patchStatus([2], "CONFIRMED");

    expect((await getPending()).map(c => c.contributionId)).toEqual([1]);
    expect((await getPending(OTHER_BASE)).map(c => c.contributionId)).toEqual([3, 4]);
  });

  it("REJECTED로 바꾼 보탬도 pending 목록에서 빠진다", async () => {
    await patchStatus([1], "REJECTED");

    expect((await getPending()).map(c => c.contributionId)).toEqual([2]);
  });

  it("여러 id를 한 번에 바꾸면 모두 pending 목록에서 빠진다", async () => {
    await patchStatus([1, 2], "CONFIRMED");

    expect(await getPending()).toEqual([]);
  });

  it("PENDING으로 되돌리면 pending 목록에 다시 나타난다", async () => {
    await patchStatus([1, 2], "CONFIRMED");
    await patchStatus([1], "PENDING");

    expect((await getPending()).map(c => c.contributionId)).toEqual([1]);
  });

  it("모두 처리하면 pending 목록이 빈 배열이다", async () => {
    await patchStatus([1, 2], "CONFIRMED");

    expect(await getPending()).toEqual([]);
  });

  it("다른 펀딩의 보탬을 PATCH하면 변경하지 않고 404를 반환한다", async () => {
    const response = await patchStatus([1, 3], "CONFIRMED");

    expect(response.status).toBe(404);
    expect((await getPending()).map(c => c.contributionId)).toEqual([1, 2]);
    expect((await getPending(OTHER_BASE)).map(c => c.contributionId)).toEqual([3, 4]);
  });

  it("보탬 상태 변경과 취소가 홈 카드의 확인 대기 건수·비율에 반영된다", async () => {
    const getCard = async () => {
      const response = await fetch("http://localhost/api/home/fundings");
      const body = await response.json();
      return body.data.fundingCards[0];
    };

    expect(await getCard()).toMatchObject({
      fundingId: 12,
      pendingContributionCount: 2,
      pendingPercentage: 20,
      confirmedPercentage: 80,
    });

    await patchStatus([1, 2], "CONFIRMED");
    expect(await getCard()).toMatchObject({
      fundingId: 12,
      pendingContributionCount: 0,
      pendingPercentage: 0,
      confirmedPercentage: 100,
    });

    await patchStatus([1], "PENDING");
    expect(await getCard()).toMatchObject({
      fundingId: 12,
      pendingContributionCount: 1,
      pendingPercentage: 10,
      confirmedPercentage: 90,
    });

    await patchStatus([1], "REJECTED");
    expect(await getCard()).toMatchObject({
      fundingId: 12,
      pendingContributionCount: 0,
      pendingPercentage: 0,
      confirmedPercentage: 90,
    });
  });
});
