import { queryOptions, useQuery } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";

export const fundingDetailQueryKey = (fundingId: number) => ["fundings", fundingId] as const;

// asMember: 토큰을 붙여 조회해야 ownerPreview(개설자 여부)가 채워진다. 비회원 조회는 서버 prefetch 값을 그대로 쓴다
export const fundingDetailQueryOptions = (fundingId: number, asMember: boolean) =>
  queryOptions({
    queryKey: fundingDetailQueryKey(fundingId),
    queryFn: () =>
      asMember
        ? fundingService.getFundingDetailAsMember(fundingId)
        : fundingService.getFundingDetail(fundingId),
    // 비회원은 서버가 받아 둔 값을 믿고, 회원은 토큰 조회로 ownerPreview를 확인하도록 마운트 때 다시 받는다
    staleTime: asMember ? 0 : 60_000,
    // 404(없는/취소된 펀딩)·403(공개 전 서프라이즈)은 재시도해도 같다
    retry: false,
  });

export const useFundingDetailQuery = (fundingId: number, asMember: boolean) =>
  useQuery(fundingDetailQueryOptions(fundingId, asMember));
