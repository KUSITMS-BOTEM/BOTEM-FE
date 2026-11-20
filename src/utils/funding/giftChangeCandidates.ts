import type { WishResponse } from "@/types/wish/wish";

// 위시 응답의 fundingId는 그 위시로 연 펀딩이라, 지금 이 펀딩에 걸린 위시를 찾을 수 있다
export const findFundingWish = (wishes: WishResponse[], fundingId: number) =>
  wishes.find(wish => wish.status === "FUNDING" && wish.fundingId === fundingId);

// "모인 금액 안에서 골라보세요" — 지금 고를 수 있고 모인 금액으로 살 수 있는 위시만, 현재·기존 선물은 뺀다
export const getChangeableWishes = (
  wishes: WishResponse[],
  collectedAmount: number,
  excludeWishIds: number[],
) =>
  wishes.filter(
    wish =>
      wish.status === "AVAILABLE" &&
      wish.price <= collectedAmount &&
      !excludeWishIds.includes(wish.id),
  );
