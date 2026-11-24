import { useQuery } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";

export const surpriseRevealQueryKey = (fundingId: number) =>
  ["fundings", fundingId, "surprise"] as const;

export const useSurpriseRevealQuery = (fundingId: number, enabled = true) =>
  useQuery({
    enabled,
    queryKey: surpriseRevealQueryKey(fundingId),
    queryFn: () => fundingService.getSurprise(fundingId),
    // 공개 전 404(FUNDING_016)는 화면이 잠금 안내로 처리한다
    meta: { skipGlobalError: true },
    // 403·404는 다시 호출해도 같다
    retry: false,
  });
