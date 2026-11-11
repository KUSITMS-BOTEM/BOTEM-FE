import { useInfiniteQuery } from "@tanstack/react-query";

import { wishService } from "@/apis/wish/wishService";

const PAGE_SIZE = 4;

export const useHomeWishesQuery = () =>
  useInfiniteQuery({
    queryKey: ["wishes", "home"],
    queryFn: ({ pageParam }) => wishService.getWishesPage(pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: lastPage => (lastPage?.hasNext ? lastPage.page + 1 : undefined),
    meta: { skipGlobalError: true },
  });
