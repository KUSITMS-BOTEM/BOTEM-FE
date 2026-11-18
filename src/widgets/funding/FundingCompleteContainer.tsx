"use client";

import { AnimatePresence, motion, useReducedMotion, type Easing } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import ToastMessage from "@/components/ToastMessage";
import { APP_MAX_WIDTH_CLASS } from "@/constants/layout";
import { useFundingContributionStore } from "@/store/fundingContributionStore";
import FundingBragCard from "@/widgets/funding/FundingBragCard";
import FundingCompleteConfetti from "@/widgets/funding/FundingCompleteConfetti";
import FundingCompleteTitle from "@/widgets/funding/FundingCompleteTitle";
import FundingProgressCard from "@/widgets/funding/FundingProgressCard";
import FundingRiseBubble from "@/widgets/funding/FundingRiseBubble";
import SampleProduct from "@/assets/images/samples/sample-product.png";
import IconClose from "@/assets/icons/icon-close.svg?react";
import IconShare from "@/assets/icons/icon-share.svg?react";

// TODO(API): 보탬 완료 응답과 펀딩 조회 API가 정해지면 교체한다 (N번째 보탬·상승률은 서버 계산값이 필요하다)
const MOCK_COMPLETE = {
  hostName: "지유",
  giverName: "민지",
  contributionOrder: 3,
  risePercent: 20,
  productName: "소니 WH-1000XM5",
  productImageUrl: SampleProduct.src,
  deadline: "2026-12-31",
  currentAmount: 74074074,
  targetAmount: 123456789,
};

// Figma 12.2초 타임라인(한 번만 재생): 진행률 장면 → 2.3초에 자랑 장면으로 전환 → 공유 버튼은 전환 2.26초 뒤에 등장
const SHARE_SCENE_AT_MS = 2300;
const CTA_AT_MS = 4560;
const TOAST_DURATION_MS = 2000;

const EASE: Easing = [0.87, 0, 0.13, 1];

type FundingCompleteContainerProps = {
  fundingId: string;
};

export default function FundingCompleteContainer({ fundingId }: FundingCompleteContainerProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const funding = MOCK_COMPLETE;
  // 금액 없이 메시지만 보탠 경우(amount 0)에는 올라간 달성률이 없다. 아래 cleanup의 reset이 StrictMode에서 먼저 돌 수 있어 첫 렌더 값을 붙잡아 둔다
  const [isMessageOnly] = useState(() => useFundingContributionStore.getState().amount === 0);
  // 0: 진행률 장면, 1: 자랑 장면, 2: 자랑 장면 + 공유 버튼
  const [step, setStep] = useState(0);
  const [toast, setToast] = useState<"success" | "fail" | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scene = reduceMotion ? 2 : step;
  const isShareScene = scene >= 1;

  useEffect(() => {
    if (reduceMotion) return;
    const timers = [
      setTimeout(() => setStep(1), SHARE_SCENE_AT_MS),
      setTimeout(() => setStep(2), CTA_AT_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  // 완료 페이지를 떠나면 보태기 플로우의 비밀번호 등 입력값을 메모리에서 지운다
  useEffect(() => () => useFundingContributionStore.getState().reset(), []);

  const showToast = (result: "success" | "fail") => {
    setToast(result);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/share/${fundingId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${funding.hostName}에게 보탬`, url });
        return;
      } catch (error) {
        // 사용자가 공유창을 닫은 경우다. 그 외 실패는 링크 복사로 넘어간다
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("success");
    } catch {
      showToast("fail");
    }
  };

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <Header
        title=""
        rightItems={[
          {
            icon: <IconClose />,
            ariaLabel: "닫기",
            // 완료 페이지를 히스토리에서 지워 뒤로가기로 돌아오지 않게 한다
            onClick: () => router.replace(`/share/${fundingId}`),
          },
        ]}
      />
      <div className="relative px-5 pt-3">
        {!reduceMotion && <FundingCompleteConfetti />}
        <div className="relative grid">
          <AnimatePresence initial={false}>
            {!isShareScene && (
              <motion.div
                key="progress-title"
                exit={{ opacity: 0, y: -10, transition: { duration: 0.28, ease: EASE } }}
                className="col-start-1 row-start-1">
                <FundingCompleteTitle
                  title={`${funding.hostName}에게\n보탬이 되었어요`}
                  description={`${funding.hostName}가 확인하면 확정돼요`}
                />
              </motion.div>
            )}
            {isShareScene && (
              <motion.div
                key="share-title"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.217, duration: 0.28, ease: EASE }}
                className="col-start-1 row-start-1">
                <FundingCompleteTitle
                  title={`${funding.hostName}에게\n${funding.contributionOrder}번째로 보탬!`}
                  description={`${funding.hostName}에게 보탠 내용을 공유해볼까요?`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="relative mt-5.5 grid">
          {/* initial={false}를 주면 처음부터 있던 자식(진행률 카드·뱃지)의 등장 모션이 전부 꺼진다 */}
          <AnimatePresence>
            {!isShareScene && (
              <motion.div
                key="progress-card"
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.55, ease: "linear" } }}
                className="relative col-start-1 row-start-1">
                <FundingProgressCard
                  fundingId={fundingId}
                  productImageUrl={funding.productImageUrl}
                  productName={funding.productName}
                  deadline={funding.deadline}
                  currentAmount={funding.currentAmount}
                  targetAmount={funding.targetAmount}
                  popStatus>
                  {!isMessageOnly && <FundingRiseBubble risePercent={funding.risePercent} />}
                </FundingProgressCard>
              </motion.div>
            )}
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
                className="relative col-start-1 row-start-1 aspect-320/401 w-full">
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
          </AnimatePresence>
        </div>
      </div>
      {scene >= 2 && (
        // BottomCTA가 fixed라 변형(transform)은 조상에 걸어야 한다. 높이 0짜리 fixed 틀이 containing block이 되어 CTA는 화면 하단에 그대로 붙는다
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 140, scaleX: 0.9, scaleY: 1.1 }}
          animate={{ opacity: 1, y: [140, -10, 0], scaleX: [0.9, 1.03, 1], scaleY: [1.1, 0.95, 1] }}
          transition={{
            opacity: { duration: 0.282, ease: EASE },
            y: { duration: 0.799, times: [0, 0.703, 1], ease: [EASE, "linear"] },
            scaleX: { duration: 0.799, times: [0, 0.703, 1], ease: [EASE, "linear"] },
            scaleY: { duration: 0.799, times: [0, 0.703, 1], ease: [EASE, "linear"] },
          }}
          className={`fixed inset-x-0 bottom-0 z-10 mx-auto h-0 w-full ${APP_MAX_WIDTH_CLASS}`}>
          <BottomCTA>
            <Button color="neutral" size="xlarge" leftIcon={<IconShare />} onClick={handleShare}>
              공유하기
            </Button>
          </BottomCTA>
        </motion.div>
      )}
      <ToastMessage
        show={toast !== null}
        state={toast === "success"}
        text={toast === "fail" ? "링크를 복사하지 못했어요" : "링크를 복사했어요"}
        className="pointer-events-none fixed bottom-32 left-1/2 z-20 -translate-x-1/2"
      />
    </main>
  );
}
