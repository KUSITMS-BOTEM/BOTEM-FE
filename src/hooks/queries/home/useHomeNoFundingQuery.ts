import { useQuery } from "@tanstack/react-query";

import { homeService } from "@/apis/home/homeService";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";

export const homeNoFundingQueryKey = [...homeQueryKey, "no-funding"] as const;

export const useHomeNoFundingQuery = ({ enabled }: { enabled: boolean }) =>
  useQuery({
    queryKey: homeNoFundingQueryKey,
    queryFn: homeService.getNoFunding,
    enabled,
    meta: { skipGlobalError: true },
  });
