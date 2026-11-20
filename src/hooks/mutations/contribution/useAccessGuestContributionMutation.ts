import { useMutation } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import type { AccessGuestContributionRequest } from "@/types/contribution/contribution";

// 이름·비밀번호 불일치(FUNDING_025)와 잠금(FUNDING_029)은 입력 시트 안에서 안내하므로 전역 Dialog를 건너뛴다
export const useAccessGuestContributionMutation = (shareKey: string) =>
  useMutation({
    mutationFn: (body: AccessGuestContributionRequest) =>
      contributionService.accessGuestContribution(shareKey, body),
    meta: { skipGlobalError: true },
  });
