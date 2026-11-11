import { setupServer } from "msw/node";

import { BANKS } from "@/constants/bank";

import { payoutAccountHandlers } from "../payoutAccountService.msw";

describe("payoutAccountHandlers GET /api/users/me/payout-accounts", () => {
  const server = setupServer(...payoutAccountHandlers);

  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it("ApiResponse 형태로 받을 계좌 배열을 반환한다", async () => {
    const response = await fetch("http://localhost/api/users/me/payout-accounts");
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it("대표 계좌를 하나 포함하고 은행 코드가 BANKS에 있는 값이다", async () => {
    const response = await fetch("http://localhost/api/users/me/payout-accounts");
    const body = await response.json();
    const accounts: { bank: string; isDefault: boolean }[] = body.data;

    expect(accounts.filter(account => account.isDefault)).toHaveLength(1);
    accounts.forEach(account => {
      expect(BANKS.map(bank => bank.code)).toContain(account.bank);
    });
  });
});
