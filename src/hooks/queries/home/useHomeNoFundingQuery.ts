import { useQuery } from "@tanstack/react-query";

import { homeService } from "@/apis/home/homeService";

export const useHomeNoFundingQuery = ({ enabled }: { enabled: boolean }) =>
  useQuery({
    queryKey: ["home", "no-funding"],
    queryFn: homeService.getNoFunding,
    enabled,
    meta: { skipGlobalError: true },
  });
