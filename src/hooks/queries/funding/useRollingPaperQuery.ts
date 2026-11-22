import { useQuery } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";

export const rollingPaperQueryKey = (fundingId: number) =>
  ["fundings", fundingId, "rolling-paper"] as const;

export const useRollingPaperQuery = (fundingId: number, enabled = true) =>
  useQuery({
    queryKey: rollingPaperQueryKey(fundingId),
    queryFn: () => fundingService.getRollingPaper(fundingId),
    enabled,
    // 권한 없음·공개 전(403)·결과 열기 전(409)은 다시 호출해도 같아, 화면이 재시도 안내로 처리한다
    meta: { skipGlobalError: true },
    retry: false,
  });
