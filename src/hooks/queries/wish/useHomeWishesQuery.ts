import { useInfiniteQuery } from "@tanstack/react-query";

import { wishService } from "@/apis/wish/wishService";

const PAGE_SIZE = 4;

// GET /api/wishes?size=4 — 무한 쿼리라 data 형태가 ["wishes"] 단순 조회와 달라 size 파라미터로 키를 구분한다
export const homeWishesQueryKey = ["wishes", { size: PAGE_SIZE }] as const;

export const useHomeWishesQuery = () =>
  useInfiniteQuery({
    queryKey: homeWishesQueryKey,
    queryFn: ({ pageParam }) => wishService.getWishesPage(pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: lastPage => (lastPage?.hasNext ? lastPage.page + 1 : undefined),
    meta: { skipGlobalError: true },
  });
