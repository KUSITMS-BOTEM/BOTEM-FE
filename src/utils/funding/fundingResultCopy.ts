import { formatWon, getShortfall } from "@/utils/funding/giftChangeAmount";

type FundingResultCopyInput = {
  goalAchieved: boolean;
  collectedAmount: number;
  productPrice: number;
  giftChanged: boolean;
};

export function getFundingResultCopy({
  goalAchieved,
  collectedAmount,
  productPrice,
  giftChanged,
}: FundingResultCopyInput) {
  const amount = formatWon(collectedAmount);
  if (goalAchieved) {
    return {
      title: `${amount}이\n모두 모였어요\n선물을 사러갈까요?`,
      productTitle: formatWon(productPrice),
      productDescription: "나의 위시 상품",
    };
  }
  return {
    title: `${amount}이\n모였어요\n어떻게 할까요?`,
    productTitle: `차액 ${formatWon(getShortfall(productPrice, collectedAmount))}만\n보태면 구매할 수 있어요`,
    productDescription: giftChanged ? "변경한 선물" : "기존 선물",
  };
}
