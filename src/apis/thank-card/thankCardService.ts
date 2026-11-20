import { clientApi } from "@/apis/client";
import type { ThankCardResponse } from "@/types/thank-card/thankCard";

export const thankCardService = {
  getSharedThankCard: (shareKey: string) =>
    clientApi.get<ThankCardResponse>(`/api/thank-cards/${shareKey}`),
};
