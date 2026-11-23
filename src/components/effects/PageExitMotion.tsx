"use client";

import { type ReactNode } from "react";
import { motion, MotionConfig } from "framer-motion";

import { APP_MAX_WIDTH_CLASS } from "@/constants/layout";
import { SLIDE_TRANSITION } from "@/constants/motion";
import type { PageExit, PageExitType } from "@/hooks/usePageExit";
import { cn } from "@/utils/cn";

const EXIT_TARGET: Record<PageExitType, { x: string } | { opacity: number }> = {
  slide: { x: "100%" },
  fade: { opacity: 0 },
};

// 이동이 실패해 퇴장 상태가 되돌려지면 원위치로 돌아온다. x:0이면 transform이 none이라 fixed 자식 기준이 바뀌지 않는다
const RESTING_TARGET = { x: 0, opacity: 1 };

type PageExitMotionProps = {
  exit: PageExit | null;
  slideIn?: boolean;
  children: ReactNode;
};

// App Router는 이동 즉시 페이지를 언마운트해 퇴장 애니메이션을 못 붙이므로, 애니메이션이 끝난 뒤에 이동한다
export default function PageExitMotion({ exit, slideIn, children }: PageExitMotionProps) {
  return (
    <MotionConfig reducedMotion="user">
      {/* transform이 걸린 요소는 fixed 자식(고정 헤더·BottomCTA)의 기준 박스가 된다.
          퇴장 중에는 뷰포트 크기로 고정하고 스크롤만큼 콘텐츠를 올려, fixed 요소가 보이던 자리 그대로 함께 움직이게 한다 */}
      <div
        className={cn(
          "flex flex-col",
          exit
            ? cn("fixed inset-0 mx-auto w-full overflow-hidden", APP_MAX_WIDTH_CLASS)
            : "flex-1 overflow-x-clip",
        )}>
        <motion.div
          className="flex flex-1 flex-col"
          style={
            exit ? { marginTop: `calc(env(safe-area-inset-top) - ${exit.scrollY}px)` } : undefined
          }
          initial={slideIn ? { x: "100%" } : false}
          animate={exit ? EXIT_TARGET[exit.type] : RESTING_TARGET}
          transition={SLIDE_TRANSITION}
          // 원위치 애니메이션의 완료 이벤트가 퇴장 직후에 늦게 도착할 수 있어, 퇴장 목표로 끝났을 때만 이동한다
          onAnimationComplete={definition => {
            if (exit && definition === EXIT_TARGET[exit.type]) exit.onComplete();
          }}>
          {children}
        </motion.div>
      </div>
    </MotionConfig>
  );
}
