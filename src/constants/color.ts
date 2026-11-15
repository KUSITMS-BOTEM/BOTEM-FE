export type Color = "orange" | "pink" | "lime" | "blue";

// Tailwind가 클래스를 정적으로 감지하도록 완성된 문자열로 둔다
export const LETTER_ACCENT_TEXT_CLASS: Record<Color, string> = {
  orange: "text-base-orange-500",
  pink: "text-base-pink-500",
  lime: "text-base-lime-500",
  blue: "text-base-blue-500",
};
