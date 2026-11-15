export type Color = "orange" | "pink" | "lime" | "blue";

// Tailwind가 클래스를 정적으로 감지하도록 완성된 문자열로 둔다
export const LETTER_ACCENT_TEXT_CLASS: Record<Color, string> = {
  orange: "text-base-orange-500",
  pink: "text-base-pink-500",
  lime: "text-base-lime-500",
  blue: "text-base-blue-500",
};

export const LETTER_ACCENT_BG_CLASS: Record<Color, string> = {
  orange: "bg-base-orange-500",
  pink: "bg-base-pink-500",
  lime: "bg-base-lime-500",
  blue: "bg-base-blue-500",
};

export const RECORD_BUTTON_BG_CLASS: Record<Color, string> = {
  orange: "bg-semantic-fill-brand",
  pink: "bg-semantic-fill-pink",
  lime: "bg-semantic-fill-lime",
  blue: "bg-semantic-fill-blue",
};

// 라임 배경에서만 아이콘이 검정이다 (Figma 기준)
export const RECORD_BUTTON_ICON_CLASS: Record<Color, string> = {
  orange: "text-semantic-icon-on-fill",
  pink: "text-semantic-icon-on-fill",
  lime: "text-semantic-text-strong",
  blue: "text-semantic-icon-on-fill",
};
