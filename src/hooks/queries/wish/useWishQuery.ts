import { useQuery } from "@tanstack/react-query";

import { wishService } from "@/apis/wish/wishService";

export const useWishQuery = (wishId: string) =>
  useQuery({
    queryKey: ["wishes", wishId],
    queryFn: () => wishService.getWish(wishId),
    meta: { skipGlobalError: true },
    // 에러 코드별 리다이렉트를 페이지에서 직접 처리하므로, 재시도 지연으로 그 처리가 늦어지지 않게 한다
    retry: false,
  });
