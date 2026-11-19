import { useQuery } from "@tanstack/react-query";

import { homeService } from "@/apis/home/homeService";

// 개설 직후 "fundings"와 "no-funding" 둘 다 바뀌므로 변경 쪽은 이 접두사로 한 번에 무효화한다
export const homeQueryKey = ["home"] as const;

export const useHomeFundingsQuery = () =>
  useQuery({
    queryKey: [...homeQueryKey, "fundings"],
    queryFn: homeService.getFundings,
    meta: { skipGlobalError: true },
  });
