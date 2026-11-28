import { queryOptions, useQuery } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import type { FundingDetailResponse } from "@/types/funding/fundingDetail";

export const fundingDetailQueryKey = (shareKey: string) => ["fundings", "share", shareKey] as const;

// 다른 사람이 보태거나 개설자가 확인한 달성률을 상세 화면에 반영하는 주기. 개설자 관리 상세도 같은 값을 쓴다
export const FUNDING_PROGRESS_POLL_INTERVAL = 20_000;

// asMember: 토큰을 붙여 조회해야 ownerPreview(개설자 여부)가 채워진다. 비회원 조회는 서버 prefetch 값을 그대로 쓴다
// enabled: 서프라이즈는 로그인 전에 조회하지 않는다. skipGlobalError: 받는 사람의 403은 화면이 직접 처리한다
// poll: 상세 화면에서만 달성률을 주기적으로 다시 받는다
type FundingDetailQueryConfig = { enabled?: boolean; skipGlobalError?: boolean; poll?: boolean };

// 마감 뒤에도 개설자가 확인 대기를 확정하면 달성률이 바뀌므로 대기분이 남아 있으면 계속 받는다
const isProgressChanging = (detail: FundingDetailResponse) =>
  detail.displayStatus === "IN_PROGRESS" || detail.pendingPercentage > 0;

export const fundingDetailQueryOptions = (
  shareKey: string,
  asMember: boolean,
  { enabled = true, skipGlobalError = false, poll = false }: FundingDetailQueryConfig = {},
) =>
  queryOptions({
    queryKey: fundingDetailQueryKey(shareKey),
    enabled,
    // quietRefetch를 poll과 묶지 않는다. 같은 키를 구독하는 화면끼리 meta가 달라 안내 여부가 엇갈리지 않게 한다
    meta: { skipGlobalError, quietRefetch: true },
    refetchInterval: query =>
      poll && query.state.data && isProgressChanging(query.state.data)
        ? FUNDING_PROGRESS_POLL_INTERVAL
        : false,
    queryFn: () =>
      asMember
        ? fundingService.getFundingDetailAsMember(shareKey)
        : fundingService.getFundingDetail(shareKey),
    // 비회원은 서버가 받아 둔 값을 믿고, 회원은 토큰 조회로 ownerPreview를 확인하도록 마운트 때 다시 받는다
    staleTime: asMember ? 0 : 60_000,
    // 404(없는/취소된 펀딩)·403(공개 전 서프라이즈)은 재시도해도 같다
    retry: false,
  });

export const useFundingDetailQuery = (
  shareKey: string,
  asMember: boolean,
  config?: FundingDetailQueryConfig,
) => useQuery(fundingDetailQueryOptions(shareKey, asMember, config));
