import { useQuery } from "@tanstack/react-query";

import { wishService } from "@/apis/wish/wishService";

export const useWishQuery = (wishId: string) =>
  useQuery({
    queryKey: ["wishes", wishId],
    queryFn: () => wishService.getWish(wishId),
    meta: { skipGlobalError: true },
  });
