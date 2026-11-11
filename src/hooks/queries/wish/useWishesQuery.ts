import { useQuery } from "@tanstack/react-query";

import { wishService } from "@/apis/wish/wishService";

// 시트처럼 항상 마운트돼 있는 UI가 열릴 때만 요청하도록 enabled를 받는다
export const useWishesQuery = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: ["wishes"],
    queryFn: wishService.getWishes,
    enabled,
    meta: { skipGlobalError: true },
  });
