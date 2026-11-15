// 301000 → "301,000원"
export const formatWon = (amount: number) => `${amount.toLocaleString("ko-KR")}원`;

// 모인 금액이 선물 가격 이상이면 더 보탤 금액은 0원
export const getShortfall = (price: number, collectedAmount: number) =>
  Math.max(price - collectedAmount, 0);

export const getRemainingAmount = (collectedAmount: number, price: number) =>
  collectedAmount - price;
