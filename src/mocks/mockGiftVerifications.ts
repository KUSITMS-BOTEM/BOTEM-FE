import type { GiftVerificationTargetResponse } from "@/types/home/home";
import { MOCK_RECOMMENDED_PRODUCTS } from "@/mocks/mockRecommendedProducts";

const [product1, product2] = MOCK_RECOMMENDED_PRODUCTS;

// 인증을 완료하면 목록·배너에서 빠지는 흐름을 확인할 수 있도록 홈·인증 핸들러가 같은 목록을 공유한다
let mockTargets: GiftVerificationTargetResponse[] = [
  {
    giftVerificationId: 101,
    fundingId: 12,
    productName: product1.name,
    productImageUrl: product1.imageUrl,
    fundingDeadline: "2026-10-13T23:59:59",
    participantCount: 6,
    replacementProductName: null,
  },
  {
    giftVerificationId: 102,
    fundingId: 13,
    productName: product2.name,
    productImageUrl: product2.imageUrl,
    fundingDeadline: "2026-09-30T23:59:59",
    participantCount: 9,
    replacementProductName: null,
  },
];

export const getMockGiftVerificationTargets = () => mockTargets;

export const completeMockGiftVerification = (giftVerificationId: number) => {
  const target = mockTargets.find(item => item.giftVerificationId === giftVerificationId);
  mockTargets = mockTargets.filter(item => item.giftVerificationId !== giftVerificationId);
  return target;
};
