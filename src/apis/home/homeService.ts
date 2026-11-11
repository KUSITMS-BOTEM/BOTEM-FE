import { clientApi } from "@/apis/client";
import type {
  GiftVerificationBannerResponse,
  GiftVerificationTargetListResponse,
  HomeFundingListResponse,
  HomeNoFundingResponse,
  SurpriseRevealCardListResponse,
} from "@/types/home/home";

export const homeService = {
  getFundings: () => clientApi.get<HomeFundingListResponse>("/api/home/fundings"),
  getNoFunding: () => clientApi.get<HomeNoFundingResponse>("/api/home/no-funding"),
  getGiftVerificationBanner: () =>
    clientApi.get<GiftVerificationBannerResponse>("/api/home/gift-verifications/banner"),
  getGiftVerificationTargets: () =>
    clientApi.get<GiftVerificationTargetListResponse>("/api/home/gift-verifications"),
  getSurpriseReveals: () =>
    clientApi.get<SurpriseRevealCardListResponse>("/api/home/surprise-reveals"),
};
