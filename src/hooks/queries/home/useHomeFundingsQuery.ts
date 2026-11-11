import { useQuery } from "@tanstack/react-query";

import { homeService } from "@/apis/home/homeService";

export const useHomeFundingsQuery = () =>
  useQuery({
    queryKey: ["home", "fundings"],
    queryFn: homeService.getFundings,
    meta: { skipGlobalError: true },
  });
