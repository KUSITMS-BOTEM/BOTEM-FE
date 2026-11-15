export const LETTER_TEXT_LARGE_MAX_LENGTH = 110;

export type LetterTextSize = "large" | "small";

// 이모지 같은 서로게이트 쌍이 하나로 세어지도록 코드포인트 기준으로 센다
export function getLetterTextSize(text: string): LetterTextSize {
  return Array.from(text).length <= LETTER_TEXT_LARGE_MAX_LENGTH ? "large" : "small";
}
