import { cn } from "@/utils/cn";
import { LETTER_ACCENT_TEXT_CLASS, type Color } from "@/constants/color";
import IconRecord from "@/assets/icons/multicolor/letter-tool-record.svg?react";
import IconSticker from "@/assets/icons/multicolor/letter-tool-sticker.svg?react";
import IconPhoto from "@/assets/icons/multicolor/letter-tool-photo.svg?react";
import IconLetter from "@/assets/icons/multicolor/letter-tool-letter.svg?react";

export type LetterToolType = "record" | "sticker" | "photo" | "letter";

// 아이콘 SVG의 검은 채움은 svgr의 "#222222"→currentColor 치환을 피하려고 fill 속성 대신 style로 지정했다
// Figma 회전은 반시계가 양수라 CSS rotate와 부호가 반대다
const TOOLS: Record<LetterToolType, { Icon: typeof IconRecord; label: string; rotate: string }> = {
  record: { Icon: IconRecord, label: "녹음", rotate: "rotate-[-10.556deg]" },
  sticker: { Icon: IconSticker, label: "스티커", rotate: "rotate-[11.324deg]" },
  photo: { Icon: IconPhoto, label: "사진 추가", rotate: "rotate-[-3.666deg]" },
  letter: { Icon: IconLetter, label: "편지지", rotate: "rotate-[16.67deg]" },
};

type LetterToolProps = {
  type: LetterToolType;
  color: Color;
  onClick?: () => void;
  className?: string;
};

export default function LetterTool({ type, color, onClick, className }: LetterToolProps) {
  const { Icon, label, rotate } = TOOLS[type];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[72px] w-[61px] flex-col items-center justify-center gap-2 py-[7px]",
        rotate,
        className,
      )}>
      <Icon aria-hidden className={LETTER_ACCENT_TEXT_CLASS[color]} />
      <span className="text-semantic-text-strong text-center tracking-[-0.02em] whitespace-nowrap [font:var(--semantic-label-x-small)] [text-rendering:geometricPrecision]">
        {label}
      </span>
    </button>
  );
}
