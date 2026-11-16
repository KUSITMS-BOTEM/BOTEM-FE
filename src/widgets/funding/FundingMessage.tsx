"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/utils/cn";

// Figma Motion 노트: 사연 → 공약을 각 5초씩 보여주고(10초 루프), 진입 400ms ease.standard / 퇴장 300ms ease.exit, 이동 24px
const SLIDE_INTERVAL_MS = 5000;
const SLIDE_DISTANCE = 24;
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const EASE_EXIT = [0.3, 0, 1, 1] as const;

const TEXT_STYLE =
  "text-semantic-text-secondary [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-subtext-medium)]";

type FundingMessageProps = {
  story?: string;
  pledge?: string;
  className?: string;
};

export default function FundingMessage({ story, pledge, className }: FundingMessageProps) {
  const texts = [story, pledge].filter((text): text is string => Boolean(text));
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const slidable = texts.length > 1 && !reduceMotion;

  useEffect(() => {
    if (!slidable) return;
    const id = setInterval(() => setIndex(prev => (prev + 1) % texts.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [slidable, texts.length]);

  if (texts.length === 0) return null;

  return (
    <div className={cn("bg-semantic-fill-neutral-weak rounded-[20px] px-5 py-3", className)}>
      {/* 슬라이드 중 박스 높이가 출렁이지 않게 모든 문구를 같은 칸에 숨겨 쌓아 가장 긴 문구에 높이를 맞춘다 */}
      <div className="grid overflow-hidden [&>*]:col-start-1 [&>*]:row-start-1">
        {texts.map((text, i) => (
          <p key={i} aria-hidden className={cn("invisible", TEXT_STYLE)}>
            {text}
          </p>
        ))}
        {slidable ? (
          <AnimatePresence initial={false}>
            <motion.p
              key={index}
              initial={{ opacity: 0, y: SLIDE_DISTANCE }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_STANDARD } }}
              exit={{
                opacity: 0,
                y: -SLIDE_DISTANCE,
                transition: { duration: 0.3, ease: EASE_EXIT },
              }}
              className={TEXT_STYLE}>
              {texts[index]}
            </motion.p>
          </AnimatePresence>
        ) : (
          <p className={TEXT_STYLE}>{texts[0]}</p>
        )}
      </div>
    </div>
  );
}
