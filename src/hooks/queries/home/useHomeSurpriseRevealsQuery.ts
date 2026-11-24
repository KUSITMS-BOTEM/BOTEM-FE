import { useQuery } from "@tanstack/react-query";

import { homeService } from "@/apis/home/homeService";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";

export const homeSurpriseRevealsQueryKey = [...homeQueryKey, "surprise-reveals"] as const;

export const useHomeSurpriseRevealsQuery = () =>
  useQuery({
    queryKey: homeSurpriseRevealsQueryKey,
    queryFn: homeService.getSurpriseReveals,
    // 공개 카드는 홈 펀딩 카드 앞에 덧붙는 보조 영역이라 실패해도 전역 토스트 없이 카드만 생략한다
    meta: { skipGlobalError: true },
  });
