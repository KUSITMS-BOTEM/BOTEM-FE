"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/utils/cn";

const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const LINE_TRANSITION = { duration: 0.2, ease: EASE_STANDARD };

type Token = { word: string; isInterim: boolean };

type CaptionLineProps = {
  tokens: Token[];
  onOverflow: () => void;
};

// 한 줄에 담기지 않으면 마지막 단어를 다음 줄로 넘기도록 알린다(단어 하나뿐이면 넘길 곳이 없다)
function CaptionLine({ tokens, onOverflow }: CaptionLineProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && tokens.length > 1 && el.scrollWidth > el.clientWidth) onOverflow();
  });

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={LINE_TRANSITION}
      className="overflow-hidden whitespace-nowrap">
      {tokens.map(({ word, isInterim }, index) => (
        <span
          key={index}
          className={isInterim ? "text-semantic-text-quaternary" : "text-semantic-text-strong"}>
          {index > 0 && " "}
          {word}
        </span>
      ))}
    </motion.p>
  );
}

type LiveCaptionProps = {
  transcript: string;
  interim: string;
  className?: string;
};

const toTokens = (text: string, isInterim: boolean): Token[] =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map(word => ({ word, isInterim }));

// 음성 인식 자막을 한 줄씩 보여준다. 줄이 차면 위로 올라가며 사라지고 이어지는 단어로 다음 줄이 시작된다
export default function LiveCaption({ transcript, interim, className }: LiveCaptionProps) {
  const [lineStart, setLineStart] = useState(0);
  const tokens = [...toTokens(transcript, false), ...toTokens(interim, true)];
  const start = Math.min(lineStart, Math.max(tokens.length - 1, 0));

  return (
    <div aria-live="polite" className={cn("min-w-0 [font:var(--semantic-label-small)]", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <CaptionLine
          key={start}
          tokens={tokens.slice(start)}
          onOverflow={() => setLineStart(tokens.length - 1)}
        />
      </AnimatePresence>
    </div>
  );
}
