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

// lime 면만 밝아서 글자를 검정으로 둔다
export const RECORD_DONE_BUTTON_CLASS: Record<Color, string> = {
  orange: "bg-semantic-fill-brand text-semantic-text-on-fill",
  pink: "bg-semantic-fill-pink text-semantic-text-on-fill",
  lime: "bg-semantic-fill-lime text-semantic-text-strong",
  blue: "bg-semantic-fill-blue text-semantic-text-on-fill",
};

// lime 면만 약한 색이 아닌 진한 면이라 글자를 검정으로 둔다
export const NAME_CHIP_CLASS: Record<Color, string> = {
  orange: "bg-semantic-fill-brand-weak text-semantic-fill-brand",
  pink: "bg-semantic-fill-pink-weak text-semantic-fill-pink",
  lime: "bg-semantic-fill-lime text-semantic-text-strong",
  blue: "bg-semantic-fill-blue-weak text-semantic-fill-blue",
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

// Figma에는 lime 선택 링(base-lime-900)만 있어 나머지 색도 같은 규칙으로 둔다
export const LETTER_PALETTE_RING_BORDER_CLASS: Record<Color, string> = {
  orange: "border-base-orange-900",
  pink: "border-base-pink-900",
  lime: "border-base-lime-900",
  blue: "border-base-blue-900",
};
