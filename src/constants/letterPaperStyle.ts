import type { Color } from "@/constants/color";

export type LetterPaperStyle = "vividSolid" | "colorDot" | "whiteDot" | "dotGrid" | "solid";

type StyleClassMap = Record<LetterPaperStyle, Record<Color, string>>;

// Tailwind가 클래스를 정적으로 감지하도록 완성된 문자열로 둔다
export const LETTER_PAPER_BG_CLASS: StyleClassMap = {
  vividSolid: {
    orange: "bg-base-orange-200",
    pink: "bg-base-pink-200",
    lime: "bg-base-lime-200",
    blue: "bg-base-blue-200",
  },
  colorDot: {
    orange: "bg-base-orange-50",
    pink: "bg-base-pink-50",
    lime: "bg-base-lime-50",
    blue: "bg-base-blue-50",
  },
  whiteDot: {
    orange: "bg-base-orange-400",
    pink: "bg-base-pink-400",
    lime: "bg-base-lime-400",
    blue: "bg-base-blue-400",
  },
  dotGrid: {
    orange: "bg-base-gray-0",
    pink: "bg-base-gray-0",
    lime: "bg-base-gray-0",
    blue: "bg-base-gray-0",
  },
  solid: {
    orange: "bg-base-orange-50",
    pink: "bg-base-pink-50",
    lime: "bg-base-lime-50",
    blue: "bg-base-blue-50",
  },
};

// 점 패턴이 없는 스타일(vividSolid·solid)은 키를 두지 않는다
export const LETTER_PAPER_DOT_COLOR_CLASS: Partial<StyleClassMap> = {
  colorDot: {
    orange: "[--dot:var(--color-base-orange-300)]",
    pink: "[--dot:var(--color-base-pink-300)]",
    lime: "[--dot:var(--color-base-lime-300)]",
    blue: "[--dot:var(--color-base-blue-300)]",
  },
  whiteDot: {
    orange: "[--dot:var(--color-base-gray-0)]",
    pink: "[--dot:var(--color-base-gray-0)]",
    lime: "[--dot:var(--color-base-gray-0)]",
    blue: "[--dot:var(--color-base-gray-0)]",
  },
  dotGrid: {
    orange: "[--dot:color-mix(in_srgb,var(--color-base-orange-500)_14%,transparent)]",
    pink: "[--dot:color-mix(in_srgb,var(--color-base-pink-500)_14%,transparent)]",
    lime: "[--dot:color-mix(in_srgb,var(--color-base-lime-500)_14%,transparent)]",
    blue: "[--dot:color-mix(in_srgb,var(--color-base-blue-500)_14%,transparent)]",
  },
};

const TEXT_STRONG = "text-semantic-text-strong";
const TEXT_TERTIARY = "text-semantic-text-tertiary";
const TEXT_ON_FILL = "text-semantic-text-on-fill";

const allColors = (value: string, overrides: Partial<Record<Color, string>> = {}) => ({
  orange: value,
  pink: value,
  lime: value,
  blue: value,
  ...overrides,
});

// whiteDot은 진한 면 위라 흰 글씨지만, lime 면만 밝아서 검정 글씨를 쓴다 (Figma 기준)
export const LETTER_PAPER_TEXT_CLASS: StyleClassMap = {
  vividSolid: allColors(TEXT_STRONG),
  colorDot: allColors(TEXT_STRONG),
  whiteDot: allColors(TEXT_ON_FILL, { lime: TEXT_STRONG }),
  dotGrid: allColors(TEXT_STRONG),
  solid: allColors(TEXT_STRONG),
};

export const LETTER_PAPER_FROM_TEXT_CLASS: StyleClassMap = {
  vividSolid: allColors(TEXT_TERTIARY),
  colorDot: allColors(TEXT_TERTIARY),
  whiteDot: allColors(TEXT_ON_FILL, { lime: TEXT_TERTIARY }),
  dotGrid: allColors(TEXT_TERTIARY),
  solid: allColors(TEXT_TERTIARY),
};
