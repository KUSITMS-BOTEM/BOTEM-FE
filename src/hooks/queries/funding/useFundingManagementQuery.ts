import { useQuery } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import { FUNDING_PROGRESS_POLL_INTERVAL } from "@/hooks/queries/funding/useFundingDetailQuery";
import type { FundingManagementState } from "@/types/funding/ownerFundingDetail";

export const fundingManagementQueryKey = (fundingId: number) =>
  ["fundings", fundingId, "management"] as const;

// 개설자 본인의 확정·마감은 mutation이 캐시를 갱신하므로, 친구가 새로 보탤 수 있는 동안만 받는다
const OPEN_STATES: FundingManagementState[] = ["NO_PARTICIPANTS", "IN_PROGRESS"];

// poll: 상세 화면에서만 달성률을 주기적으로 다시 받는다
export const useFundingManagementQuery = (
  fundingId: number,
  { enabled = true, poll = false }: { enabled?: boolean; poll?: boolean } = {},
) =>
  useQuery({
    queryKey: fundingManagementQueryKey(fundingId),
    queryFn: () => fundingService.getFundingManagement(fundingId),
    enabled,
    // quietRefetch를 poll과 묶지 않는다. 같은 키를 구독하는 화면끼리 meta가 달라 안내 여부가 엇갈리지 않게 한다
    meta: { quietRefetch: true },
    refetchInterval: query =>
      poll && query.state.data && OPEN_STATES.includes(query.state.data.managementState)
        ? FUNDING_PROGRESS_POLL_INTERVAL
        : false,
  });
