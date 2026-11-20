import type { ReactNode } from "react";

import Profile from "@/components/Profile";
import type { Color } from "@/constants/color";
import { LETTER_PAPER_BG_CLASS } from "@/constants/letterPaperStyle";
import { cn } from "@/utils/cn";

export const THANK_CARD_MESSAGE_CLASS =
  "text-semantic-text-strong [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-title-large)]";

type ThankCardProps = {
  color: Color;
  recipientName: string;
  children: ReactNode;
  className?: string;
};

export default function ThankCard({ color, recipientName, children, className }: ThankCardProps) {
  return (
    <div
      className={cn(
        "border-semantic-border-inverted relative flex h-[338px] w-full flex-col gap-3 overflow-clip rounded-[28px] border px-6 pt-7 pb-6 shadow-[0_10px_30px_-4px_rgba(26,26,46,0.08)]",
        LETTER_PAPER_BG_CLASS.colorDot[color],
        className,
      )}>
      <div className="text-semantic-text-tertiary relative flex items-center gap-1.5 [font:var(--semantic-subtext-medium-strong)]">
        {/* Figma 기준 편지지 색과 무관하게 기본(주황) 프로필을 쓴다 */}
        <Profile showIconButton={false} className="size-5" />
        <span>To. {recipientName}</span>
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
