import type { GiftVerificationTargetResponse } from "@/types/home/home";
import { formatDeadlineShort } from "@/utils/funding/formatDeadline";

// 오래 기다린 인증부터 처리하도록 마감이 이른 순으로 보여준다
export const sortByOldestDeadline = (targets: GiftVerificationTargetResponse[]) =>
  [...targets].sort((a, b) => a.fundingDeadline.localeCompare(b.fundingDeadline));

// "2026-10-13T23:59:59", 6 → "10월 13일 마감 · 친구 6명"
export const formatGiftVerificationCaption = ({
  fundingDeadline,
  participantCount,
}: Pick<GiftVerificationTargetResponse, "fundingDeadline" | "participantCount">) =>
  `${formatDeadlineShort(fundingDeadline.slice(0, 10))} 마감 · 친구 ${participantCount}명`;

// 다른 상품으로 바꿔 받은 경우 실제로 받은 상품명을 보여준다
export const getReceivedProductName = ({
  productName,
  replacementProductName,
}: Pick<GiftVerificationTargetResponse, "productName" | "replacementProductName">) =>
  replacementProductName || productName;
