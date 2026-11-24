import { useQuery } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";

export const surpriseGiftPreparationQueryKey = (fundingId: number) =>
  ["fundings", fundingId, "surprise", "gift-preparation"] as const;

export const useSurpriseGiftPreparationQuery = (fundingId: number) =>
  useQuery({
    queryKey: surpriseGiftPreparationQueryKey(fundingId),
    queryFn: () => fundingService.getSurpriseGiftPreparation(fundingId),
  });
