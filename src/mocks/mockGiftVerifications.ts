import type { FundingDetailGiftVerification } from "@/types/funding/fundingDetail";
import type { GiftVerificationTargetResponse } from "@/types/home/home";
import { MOCK_RECOMMENDED_PRODUCTS } from "@/mocks/mockRecommendedProducts";

const [product1] = MOCK_RECOMMENDED_PRODUCTS;

const MOCK_TARGETS: GiftVerificationTargetResponse[] = [
  {
    giftVerificationId: 101,
    fundingId: 12,
    productName: product1.name,
    productImageUrl: product1.imageUrl,
    fundingDeadline: "2026-10-13T23:59:59",
    participantCount: 6,
    replacementProductName: null,
  },
];

// 인증 결과 화면(/share/{shareKey}/gift)을 주소로 바로 열거나 새로고침해도 확인할 수 있도록,
// 인증을 마친 기록은 메모리 대신 브라우저 localStorage에 펀딩 ID별로 남긴다. 다시 처음부터 보려면 이 키를 지운다
const COMPLETED_STORAGE_KEY = "botem-mock-completed-gift-verifications";

type CompletedRecords = Record<number, FundingDetailGiftVerification>;

// msw/node(서버 컴포넌트)에는 localStorage가 없어 인증 전 상태로 응답한다
const readCompleted = (): CompletedRecords => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(COMPLETED_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
};

const writeCompleted = (records: CompletedRecords) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // 저장소를 못 쓰면 이번 페이지에서만 인증 전 상태로 남는다
  }
};

// 인증을 완료하면 목록·배너에서 빠지는 흐름을 확인할 수 있도록 홈·인증 핸들러가 같은 기록을 본다
export const getMockGiftVerificationTargets = () => {
  const completed = readCompleted();
  return MOCK_TARGETS.filter(target => !completed[target.fundingId]);
};

export const getMockCompletedGiftVerification = (fundingId: number) =>
  readCompleted()[fundingId] ?? null;

export const completeMockGiftVerification = (
  giftVerificationId: number,
  thankYouMessage: string | null,
) => {
  const target = getMockGiftVerificationTargets().find(
    item => item.giftVerificationId === giftVerificationId,
  );
  // 업로드 URL은 가짜 S3 주소라 이미지가 뜨지 않으므로 상품 이미지를 인증 사진 대신 쓴다
  if (target) {
    writeCompleted({
      ...readCompleted(),
      [target.fundingId]: {
        imageUrl: target.productImageUrl,
        thankYouMessage,
        completedAt: new Date().toISOString(),
      },
    });
  }
  return target;
};
