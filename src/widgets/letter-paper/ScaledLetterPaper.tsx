"use client";

import { useLayoutEffect, useRef, useState } from "react";

import LetterPaper, { type LetterPaperProps } from "@/widgets/letter-paper/LetterPaper";

// LetterPaper의 고정 크기(w-[320px] h-[338px])와 같은 값. 확대 배율의 기준이다
const PAPER_WIDTH = 320;
const PAPER_HEIGHT = 338;

// 320×338 기준 px로 그려진 편지지를 부모 가로 실측값에 맞춰 통째로 비율 확대한다(FundingProgressCard와 같은 방식)
export default function ScaledLetterPaper(props: LetterPaperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // 실측 전에는 null로 두고 숨겨, 320px 고정 폭으로 그려져 좁은 화면에서 넘치는 걸 막는다
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth > 0 ? el.clientWidth / PAPER_WIDTH : 1);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{ aspectRatio: `${PAPER_WIDTH}/${PAPER_HEIGHT}` }}
      className="relative w-full">
      <div
        style={
          scale === null
            ? { display: "none" }
            : { transform: `scale(${scale})`, transformOrigin: "top left" }
        }
        className="absolute top-0 left-0">
        <LetterPaper {...props} />
      </div>
    </div>
  );
}
