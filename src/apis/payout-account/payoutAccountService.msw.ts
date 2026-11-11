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
];
