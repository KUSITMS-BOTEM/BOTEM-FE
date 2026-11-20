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

const post = (path: string, body: unknown, base = BASE) =>
  fetch(`${base}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const decide = (contributionIds: number[], decision: "CONFIRM" | "REJECT") =>
  post("decisions", { contributionIds, decision });

const undo = (contributionIds: number[]) => post("decisions/undo", { contributionIds });

describe("contributionHandlers", () => {
  it("GET pending은 해당 펀딩의 확인 대기 보탬과 건수를 반환한다", async () => {
    const response = await fetch(`${BASE}/pending`);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.error).toBeNull();
    expect(body.data.pendingContributionCount).toBe(2);
    expect(body.data.contributions[0]).toMatchObject({ participantName: "하린", amount: 45000 });
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

    await decide([1], "CONFIRM");
    expect(await getCard()).toMatchObject({
      pendingContributionCount: 1,
      pendingPercentage: 10,
      confirmedPercentage: 90,
    });

    await decide([2], "REJECT");
    expect(await getCard()).toMatchObject({
      pendingContributionCount: 0,
      pendingPercentage: 0,
      confirmedPercentage: 90,
    });
  });
});

describe("입금 확인 핸들러", () => {
  it("POST decisions CONFIRM은 선택한 참여를 CONFIRMED로 바꾸고 pending 목록에서 뺀다", async () => {
    const body = await (await decide([1, 2], "CONFIRM")).json();

    expect(body.data).toMatchObject({
      contributions: [
        { contributionId: 1, status: "CONFIRMED", changed: true },
        { contributionId: 2, status: "CONFIRMED", changed: true },
      ],
      progress: { pendingContributionCount: 0 },
    });
    expect(await getPending()).toEqual([]);
    expect((await getPending(OTHER_BASE)).map(c => c.contributionId)).toEqual([3, 4]);
  });

  it("POST decisions REJECT는 REJECTED 결과를 반환하고 pending 목록에서 뺀다", async () => {
    const body = await (await decide([2], "REJECT")).json();

    expect(body.data.contributions).toEqual([
      { contributionId: 2, status: "REJECTED", changed: true },
    ]);
    expect((await getPending()).map(c => c.contributionId)).toEqual([1]);
  });

  it("이미 같은 결과로 처리된 참여는 그대로 두고 changed를 false로 돌려준다", async () => {
    await decide([1], "CONFIRM");
    const response = await decide([1, 2], "CONFIRM");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.contributions).toEqual([
      { contributionId: 1, status: "CONFIRMED", changed: false },
      { contributionId: 2, status: "CONFIRMED", changed: true },
    ]);
  });

  it("하나라도 이미 다른 상태로 처리됐으면 409 FUNDING_030을 반환하고 아무것도 바꾸지 않는다", async () => {
    await decide([1], "CONFIRM");
    const response = await decide([1, 2], "REJECT");

    expect(response.status).toBe(409);
    expect((await response.json()).error.code).toBe("FUNDING_030");
    expect((await getPending()).map(c => c.contributionId)).toEqual([2]);
  });

  it("다른 펀딩의 보탬이 섞여 있으면 404 FUNDING_023을 반환하고 아무것도 바꾸지 않는다", async () => {
    const response = await decide([1, 3], "CONFIRM");

    expect(response.status).toBe(404);
    expect((await response.json()).error.code).toBe("FUNDING_023");
    expect((await getPending()).map(c => c.contributionId)).toEqual([1, 2]);
  });

  it("POST decisions/undo는 처리한 참여를 확인 대기로 되돌려 pending 목록에 다시 올린다", async () => {
    await decide([1], "CONFIRM");
    await decide([2], "REJECT");
    const body = await (await undo([1, 2])).json();

    expect(body.data).toMatchObject({
      contributions: [
        { contributionId: 1, status: "PENDING_CONFIRMATION", changed: true },
        { contributionId: 2, status: "PENDING_CONFIRMATION", changed: true },
      ],
      progress: { pendingContributionCount: 2 },
    });
    expect((await getPending()).map(c => c.contributionId)).toEqual([1, 2]);
  });
});
