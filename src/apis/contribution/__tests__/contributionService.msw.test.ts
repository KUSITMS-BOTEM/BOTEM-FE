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

const post = (path: string, base = BASE) => fetch(`${base}/${path}`, { method: "POST" });

describe("contributionHandlers", () => {
  it("GET pending은 해당 펀딩의 확인 대기 보탬과 건수를 반환한다", async () => {
    const response = await fetch(`${BASE}/pending`);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.error).toBeNull();
    expect(body.data.pendingContributionCount).toBe(2);
    expect(
      body.data.contributions.map((c: { participantName: string }) => c.participantName),
    ).toEqual(["하린", "도윤"]);
    expect((await getPending(OTHER_BASE)).map(c => c.contributionId)).toEqual([3, 4]);
  });

  it("보탬 처리가 홈 카드의 확인 대기 건수·비율에 반영된다", async () => {
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

    await post("1/confirm");
    expect(await getCard()).toMatchObject({
      pendingContributionCount: 1,
      pendingPercentage: 10,
      confirmedPercentage: 90,
    });

    await post("2/reject");
    expect(await getCard()).toMatchObject({
      pendingContributionCount: 0,
      pendingPercentage: 0,
      confirmedPercentage: 90,
    });
  });
});

describe("입금 확인 핸들러", () => {
  it("POST confirm은 CONFIRMED 결과를 반환하고 pending 목록에서 뺀다", async () => {
    const response = await post("1/confirm");
    const body = await response.json();

    expect(body.data).toMatchObject({
      contributionId: 1,
      status: "CONFIRMED",
      progress: { pendingContributionCount: 1 },
    });
    expect((await getPending()).map(c => c.contributionId)).toEqual([2]);
  });

  it("POST reject는 REJECTED 결과를 반환하고 pending 목록에서 뺀다", async () => {
    const body = await (await post("2/reject")).json();

    expect(body.data).toMatchObject({ contributionId: 2, status: "REJECTED" });
    expect((await getPending()).map(c => c.contributionId)).toEqual([1]);
  });

  it("같은 처리를 다시 요청하면 현재 결과를 그대로 반환한다", async () => {
    await post("1/confirm");
    const response = await post("1/confirm");

    expect(response.status).toBe(200);
  });

  it("이미 다른 상태로 처리된 보탬은 409 FUNDING_030을 반환한다", async () => {
    await post("1/confirm");
    const response = await post("1/reject");
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error.code).toBe("FUNDING_030");
  });

  it("다른 펀딩의 보탬이면 404 FUNDING_023을 반환한다", async () => {
    const response = await post("3/confirm");

    expect(response.status).toBe(404);
    expect((await response.json()).error.code).toBe("FUNDING_023");
  });

  it("POST confirm-all은 이번에 확정한 건수를 반환하고 pending 목록을 비운다", async () => {
    await post("1/reject");
    const body = await (await post("confirm-all")).json();

    expect(body.data).toMatchObject({
      confirmedCount: 1,
      progress: { pendingContributionCount: 0 },
    });
    expect(await getPending()).toEqual([]);
    expect((await getPending(OTHER_BASE)).map(c => c.contributionId)).toEqual([3, 4]);
  });
});
