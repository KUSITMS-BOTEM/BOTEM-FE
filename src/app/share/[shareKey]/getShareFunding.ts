import { cache } from "react";

import { notFound } from "next/navigation";

import { fundingServerService } from "@/apis/funding/fundingServerService";
import { ApiError } from "@/types/api";

const FUNDING_NOT_FOUND = "FUNDING_002";

// generateMetadata와 페이지가 같은 요청을 한 번만 하도록 묶는다. 없는·취소된 펀딩은 404로 보낸다
export const getShareFunding = cache(async (shareKey: string) => {
  try {
    const funding = await fundingServerService.getFundingDetail(shareKey);
    if (!funding) notFound();
    return funding;
  } catch (error) {
    if (error instanceof ApiError && error.code === FUNDING_NOT_FOUND) notFound();
    throw error;
  }
});
