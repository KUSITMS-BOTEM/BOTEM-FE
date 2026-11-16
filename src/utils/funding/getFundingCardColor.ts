import type { Color } from "@/constants/color";

const FUNDING_CARD_COLORS: Color[] = ["orange", "pink", "lime", "blue"];

// 펀딩이 바뀌어도 변하지 않는 id를 해시해, 같은 펀딩은 언제나 같은 색으로 그린다
export function getFundingCardColor(fundingId: number | string): Color {
  const key = String(fundingId);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return FUNDING_CARD_COLORS[hash % FUNDING_CARD_COLORS.length];
}
