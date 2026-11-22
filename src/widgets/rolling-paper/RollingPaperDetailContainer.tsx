"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import IconLeft from "@/assets/icons/icon-left.svg?react";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import LoadingAnimation from "@/components/LoadingAnimation";
import PageExitMotion from "@/components/effects/PageExitMotion";
import { useRollingPaperQuery } from "@/hooks/queries/funding/useRollingPaperQuery";
import { usePageExit } from "@/hooks/usePageExit";
import RollingPaperWheel from "@/widgets/rolling-paper/RollingPaperWheel";
import {
  ARRIVAL_BACK_BUTTON_TRANSITION,
  ARRIVAL_BG_TRANSITION,
} from "@/widgets/rolling-paper/rollingPaperMotion";
import { toLetterPaperProps } from "@/widgets/rolling-paper/toLetterPaperProps";
import { toRollingPaperVoice } from "@/widgets/rolling-paper/toRollingPaperVoice";

const INTERIOR_BG_GRADIENT =
  "linear-gradient(180deg, rgba(238, 238, 238, 0) 0%, rgb(238, 238, 238) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)";

// 퇴장 모션 마지막 장면(회색으로 덮인 화면)에서 이어지는 도착 페이지. 본문은 디자인 확정 전이라 비어 있다
// 롤링페이퍼 조회 응답에 id가 따로 없어 rollingPaperId는 fundingId를 쓴다
type RollingPaperDetailContainerProps = {
  rollingPaperId: string;
};

export default function RollingPaperDetailContainer({
  rollingPaperId,
}: RollingPaperDetailContainerProps) {
  const router = useRouter();
  const { pageExit, exitPage } = usePageExit();
  const { data: rollingPaper, isLoading, refetch } = useRollingPaperQuery(Number(rollingPaperId));

  const renderContent = () => {
    if (isLoading) {
      return (
        <div role="status" className="absolute inset-0 flex items-center justify-center">
          <LoadingAnimation size="large" />
          <span className="sr-only">메세지를 불러오는 중이에요</span>
        </div>
      );
    }
    if (!rollingPaper) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
            메세지를 불러오지 못했어요
          </p>
          <Button onClick={() => refetch()}>다시 시도</Button>
        </div>
      );
    }
    if (rollingPaper.messages.length === 0) {
      return (
        <p className="text-semantic-text-secondary absolute inset-0 flex items-center justify-center [font:var(--semantic-subtext-large)]">
          도착한 메세지가 없어요
        </p>
      );
    }
    return (
      <RollingPaperWheel
        letters={rollingPaper.messages.map(toLetterPaperProps)}
        voices={rollingPaper.messages.map(toRollingPaperVoice)}
      />
    );
  };

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
        {renderContent()}
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
