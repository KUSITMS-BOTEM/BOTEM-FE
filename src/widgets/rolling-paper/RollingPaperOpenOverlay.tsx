"use client";

import { motion } from "framer-motion";
import { useLayoutEffect, useRef, useState, type RefObject } from "react";

import {
  EXIT_COVER_END,
  EXIT_COVER_TRANSITION,
  toExitCoverStart,
} from "@/widgets/rolling-paper/rollingPaperMotion";

type RollingPaperOpenOverlayProps = {
  // 덮개가 커지기 시작하는 회색 영역
  backgroundRef: RefObject<HTMLElement | null>;
  onCovered: () => void;
};

// 시트 헤더(공유·닫기)까지 회색으로 덮고, 다 덮이면 onCovered로 알린다
export default function RollingPaperOpenOverlay({
  backgroundRef,
  onCovered,
}: RollingPaperOpenOverlayProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState<ReturnType<typeof toExitCoverStart> | null>(null);

  // 첫 페인트 전에 두 영역의 위치를 재서 시작 모양을 정한다
  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const sheetRect = sheet.getBoundingClientRect();
    const backgroundRect = backgroundRef.current?.getBoundingClientRect() ?? sheetRect;
    setStart(toExitCoverStart(sheetRect, backgroundRect));
  }, [backgroundRef]);

  if (!start) return <div ref={sheetRef} className="absolute inset-0 opacity-0" />;

  return (
    <motion.div
      className="bg-base-gray-100 absolute inset-0"
      initial={start}
      animate={EXIT_COVER_END}
      transition={EXIT_COVER_TRANSITION}
      onAnimationComplete={onCovered}
    />
  );
}
