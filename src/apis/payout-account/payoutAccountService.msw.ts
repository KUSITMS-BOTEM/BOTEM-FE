import { http, HttpResponse } from "msw";

export const payoutAccountHandlers = [
  http.get("*/api/users/me/payout-accounts", () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 1,
          bank: "TOSS_BANK",
          bankName: "토스뱅크",
          accountNumber: "100159014821",
          accountHolder: "지유",
          isDefault: true,
          verificationStatus: "UNVERIFIED",
        },
      ],
      error: null,
    });
  }),
  http.put("*/api/users/me/payout-accounts/:accountId", async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      // 추정 mock 값: bankName·verificationStatus는 요청에 없어 임의 값
      data: {
        id: Number(params.accountId),
        bankName: "토스뱅크",
        accountHolder: "지유",
        isDefault: true,
        verificationStatus: "UNVERIFIED",
        ...body,
      },
      error: null,
    });
  }),
];
