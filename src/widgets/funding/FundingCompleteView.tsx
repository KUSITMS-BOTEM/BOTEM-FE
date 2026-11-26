"use client";

import { motion, useReducedMotion, type Easing } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import PageExitMotion from "@/components/effects/PageExitMotion";
import ToastMessage from "@/components/ToastMessage";
import { APP_MAX_WIDTH_CLASS } from "@/constants/layout";
import { usePageExit } from "@/hooks/usePageExit";
import { usePreparedImageSave } from "@/hooks/usePreparedImageSave";
import type { FundingCompleteData } from "@/utils/funding/toFundingCompleteData";
import FundingBragCard from "@/widgets/funding/FundingBragCard";
import FundingCompleteTitle from "@/widgets/funding/FundingCompleteTitle";
import IconClose from "@/assets/icons/icon-close.svg?react";
import IconShare from "@/assets/icons/icon-share.svg?react";

// 장식용 로티라 첫 화면 번들에서 빼고, 모션을 끈 사용자는 아예 내려받지 않는다
const FundingCompleteConfetti = dynamic(() => import("@/widgets/funding/FundingCompleteConfetti"), {
  ssr: false,
});

// Figma 타임라인(한 번만 재생)의 빈 화면 대기를 절반으로 줄였다: 1.15초에 자랑 카드·제목 등장 → 공유 버튼은 Figma 간격(2.26초) 그대로 그 뒤에 등장
const SHARE_SCENE_AT_MS = 1150;
const CTA_AT_MS = 3410;

const SAVE_FAIL_TOAST_MS = 2000;
// 자랑 카드 등장 모션(배지가 마지막으로 1.1초 뒤 나타남)이 끝난 모습을 저장한다
const CARD_SETTLED_MS = 1500;

const EASE: Easing = [0.87, 0, 0.13, 1];

type FundingCompleteViewProps = {
  shareKey: string;
  funding: FundingCompleteData;
  // 닫기 뒤 돌아갈 곳. 서프라이즈 개설자처럼 공유 화면 대신 자기 펀딩 화면으로 가야 할 때 넘긴다
  closePath?: string;
};

export default function FundingCompleteView({
  shareKey,
  funding,
  closePath = `/share/${shareKey}`,
}: FundingCompleteViewProps) {
  const router = useRouter();
  const { pageExit, exitPage } = usePageExit();
  const reduceMotion = useReducedMotion() ?? false;
  // 0: 빈 화면, 1: 자랑 카드, 2: 자랑 카드 + 공유 버튼
  const [step, setStep] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const failTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isSharing, setIsSharing] = useState(false);
  const scene = reduceMotion ? 2 : step;
  const isShareScene = scene >= 1;
  const saveImage = usePreparedImageSave(cardRef, `${funding.hostName}에게-보탬.png`, {
    enabled: isShareScene,
    delayMs: CARD_SETTLED_MS,
  });

  useEffect(() => {
    if (reduceMotion) return;
    const timers = [
      setTimeout(() => setStep(1), SHARE_SCENE_AT_MS),
      setTimeout(() => setStep(2), CTA_AT_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  useEffect(() => () => clearTimeout(failTimerRef.current), []);

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      await saveImage();
    } catch {
      setSaveFailed(true);
      clearTimeout(failTimerRef.current);
      failTimerRef.current = setTimeout(() => setSaveFailed(false), SAVE_FAIL_TOAST_MS);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <PageExitMotion exit={pageExit}>
      <main className="relative flex min-h-dvh flex-col overflow-hidden pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <Header
          title=""
          rightItems={[
            {
              icon: <IconClose />,
              ariaLabel: "닫기",
              // 완료 페이지를 히스토리에서 지워 뒤로가기로 돌아오지 않게 한다
              onClick: () => exitPage("fade", () => router.replace(closePath)),
            },
          ]}
        />
        {!reduceMotion && <FundingCompleteConfetti />}
        <div className="relative px-5 pt-3">
          <div className="relative grid">
            {isShareScene && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.217, duration: 0.28, ease: EASE }}
                className="col-start-1 row-start-1">
                <FundingCompleteTitle
                  title={`${funding.hostName}에게\n${funding.contributionOrder}번째로 보탬!`}
                  description={`보탬이 확인되면 진행률에 반영돼요\n${funding.hostName}에게 보탠 내용을 공유해볼까요?`}
                />
              </motion.div>
            )}
          </div>
          <div className="relative mt-5.5 grid">
            {isShareScene && (
              <motion.div
                key="brag-card"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
                animate={
                  reduceMotion
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 1, scale: [0.94, 1.027, 0.991, 1] }
                }
                transition={{
                  opacity: { duration: 0.55, ease: "linear" },
                  scale: {
                    duration: 0.85,
                    times: [0, 0.647, 0.8, 1],
                    ease: [[0.3, 0, 0.3, 1], "linear", "linear"],
                  },
                }}
                ref={cardRef}
                // 저장되는 이미지는 이 틀 그대로라 흰 배경과 둥근 모서리를 여기서 정한다
                className="bg-semantic-fill-default relative col-start-1 row-start-1 aspect-320/401 w-full overflow-clip rounded-[32px]">
                <FundingBragCard
                  giverName={funding.giverName}
                  recipientName={funding.hostName}
                  productImageUrl={funding.productImageUrl}
                  productName={funding.productName}
                  deadline={funding.deadline}
                  reduceMotion={reduceMotion}
                />
              </motion.div>
            )}
          </div>
        </div>
        {scene >= 2 && (
          // BottomCTA가 fixed라 변형(transform)은 조상에 걸어야 한다. 높이 0짜리 fixed 틀이 containing block이 되어 CTA는 화면 하단에 그대로 붙는다
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 140, scaleX: 0.9, scaleY: 1.1 }}
            animate={{
              opacity: 1,
              y: [140, -10, 0],
              scaleX: [0.9, 1.03, 1],
              scaleY: [1.1, 0.95, 1],
            }}
            transition={{
              opacity: { duration: 0.282, ease: EASE },
              y: { duration: 0.799, times: [0, 0.703, 1], ease: [EASE, "linear"] },
              scaleX: { duration: 0.799, times: [0, 0.703, 1], ease: [EASE, "linear"] },
              scaleY: { duration: 0.799, times: [0, 0.703, 1], ease: [EASE, "linear"] },
            }}
            className={`fixed inset-x-0 bottom-0 z-10 mx-auto h-0 w-full ${APP_MAX_WIDTH_CLASS}`}>
            <BottomCTA>
              <Button
                color="neutral"
                size="xlarge"
                leftIcon={<IconShare />}
                states={isSharing ? "loading" : "default"}
                onClick={handleShare}>
                공유하기
              </Button>
            </BottomCTA>
          </motion.div>
        )}
        <ToastMessage
          show={saveFailed}
          state={false}
          text="이미지를 저장하지 못했어요"
          className="pointer-events-none fixed bottom-32 left-1/2 z-20 -translate-x-1/2"
        />
      </main>
    </PageExitMotion>
  );
}
