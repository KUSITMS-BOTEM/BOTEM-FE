import { clientApi } from "@/apis/client";
import type { HomeFundingListResponse, HomeNoFundingResponse } from "@/types/home/home";

export const homeService = {
  getFundings: () => clientApi.get<HomeFundingListResponse>("/api/home/fundings"),
  getNoFunding: () => clientApi.get<HomeNoFundingResponse>("/api/home/no-funding"),
};
