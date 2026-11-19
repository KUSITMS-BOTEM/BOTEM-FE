"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import IconLeft from "@/assets/icons/icon-left.svg?react";
import IconButton from "@/components/IconButton";
import PageExitMotion from "@/components/effects/PageExitMotion";
import { usePageExit } from "@/hooks/usePageExit";
import RollingPaperWheel from "@/widgets/rolling-paper/RollingPaperWheel";
import {
  ARRIVAL_BACK_BUTTON_TRANSITION,
  ARRIVAL_BG_TRANSITION,
} from "@/widgets/rolling-paper/rollingPaperMotion";

const INTERIOR_BG_GRADIENT =
  "linear-gradient(180deg, rgba(238, 238, 238, 0) 0%, rgb(238, 238, 238) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)";

// 퇴장 모션 마지막 장면(회색으로 덮인 화면)에서 이어지는 도착 페이지. 본문은 디자인 확정 전이라 비어 있다
type RollingPaperDetailContainerProps = {
  count: number;
};

export default function RollingPaperDetailContainer({ count }: RollingPaperDetailContainerProps) {
  const router = useRouter();
  const { pageExit, exitPage } = usePageExit();

  return (
    <PageExitMotion exit={pageExit}>
      <div className="bg-base-gray-100 relative flex flex-1 flex-col overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundImage: INTERIOR_BG_GRADIENT }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={ARRIVAL_BG_TRANSITION}
        />
        <RollingPaperWheel count={count} />
        <motion.header
          className="relative z-10 h-16 w-full shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={ARRIVAL_BACK_BUTTON_TRANSITION}>
          <IconButton
            size="xlarge"
            icon={<IconLeft />}
            aria-label="뒤로 가기"
            onClick={() => exitPage("slide", () => router.back())}
            className="absolute top-3 left-2.5"
          />
        </motion.header>
      </div>
    </PageExitMotion>
  );
}
