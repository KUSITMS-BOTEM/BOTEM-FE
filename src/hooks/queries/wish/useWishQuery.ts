import { useQuery } from "@tanstack/react-query";

import { wishService } from "@/apis/wish/wishService";
import { ApiError } from "@/types/api";

export const useWishQuery = (wishId: string) =>
  useQuery({
    queryKey: ["wishes", wishId],
    queryFn: () => wishService.getWish(wishId),
    meta: { skipGlobalError: true },
    // WISH_002(없음)·AUTH_*(인증 실패)는 페이지에서 리다이렉트로 즉시 처리하므로 재시도하지 않고, 네트워크 오류 등은 기본대로 재시도한다
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        (error.code === "WISH_002" || error.code.startsWith("AUTH_"))
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
