import { useQuery } from "@tanstack/react-query";

import { homeService } from "@/apis/home/homeService";

export const giftVerificationTargetsQueryKey = ["home", "gift-verifications"] as const;

export const useGiftVerificationTargetsQuery = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: giftVerificationTargetsQueryKey,
    queryFn: homeService.getGiftVerificationTargets,
    enabled,
    meta: { skipGlobalError: true },
  });
