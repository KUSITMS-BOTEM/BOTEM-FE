import { useQuery } from "@tanstack/react-query";

import { wishProfileService } from "@/apis/wish-profile/wishProfileService";

export const wishProfileQueryKey = (wishProfileKey: string) =>
  ["wish-profiles", wishProfileKey] as const;

export const useWishProfileQuery = (wishProfileKey: string) =>
  useQuery({
    queryKey: wishProfileQueryKey(wishProfileKey),
    queryFn: () => wishProfileService.getWishProfile(wishProfileKey),
    // 화면이 재시도 UI를 직접 보여주므로 전역 에러 다이얼로그를 띄우지 않는다
    meta: { skipGlobalError: true },
  });
