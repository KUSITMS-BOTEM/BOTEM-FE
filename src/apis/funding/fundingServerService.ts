import { serverApi } from "@/apis/server";
import type { FundingDetailResponse } from "@/types/funding/fundingDetail";

// 서버 컴포넌트용 공개 GET. 토큰 없이 호출하므로 ownerPreview는 항상 false다
export const fundingServerService = {
  getFundingDetail: (shareKey: string) =>
    serverApi.get<FundingDetailResponse>(`/api/fundings/share/${shareKey}`),
};
