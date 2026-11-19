import { useQuery } from "@tanstack/react-query";

import { homeService } from "@/apis/home/homeService";

export const giftVerificationBannerQueryKey = ["home", "gift-verifications", "banner"] as const;

export const useGiftVerificationBannerQuery = () =>
  useQuery({
    queryKey: giftVerificationBannerQueryKey,
    queryFn: homeService.getGiftVerificationBanner,
    // 배너는 부가 안내라 실패해도 홈을 막지 않고 숨기기만 한다
    meta: { skipGlobalError: true },
  });
