import { useQuery } from "@tanstack/react-query";

import { wishService } from "@/apis/wish/wishService";

// GET /api/wishes — 위시 키 전체의 prefix라 invalidateQueries({ queryKey: wishesQueryKey })로 도메인 단위 무효화도 된다
export const wishesQueryKey = ["wishes"] as const;

// 시트처럼 항상 마운트돼 있는 UI가 열릴 때만 요청하도록 enabled를 받는다
export const useWishesQuery = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: wishesQueryKey,
    queryFn: wishService.getWishes,
    enabled,
    meta: { skipGlobalError: true },
  });
