"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import Badge from "@/components/Badge";
import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import OpenSheet from "@/components/OpenSheet";
import Title from "@/components/Title";
import ToastMessage from "@/components/ToastMessage";
import { useShareLink } from "@/hooks/useShareLink";
import { formatDeadlineShort } from "@/utils/funding/formatDeadline";
import { saveNodeAsImage } from "@/utils/saveNodeAsImage";
import FundingBragCard from "@/widgets/funding/FundingBragCard";
import IconDownload from "@/assets/icons/icon-download.svg?react";

const SAVE_FAIL_TOAST_MS = 2000;

type SurpriseReadySheetProps = {
  open: boolean;
  shareKey: string;
  recipientName: string;
  /** 받는 사람에게 공개되는 시각. 예: "10월 13일 0시" */
  revealDateLabel: string;
  /** 함께한 친구 수 */
  contributorCount: number;
  /** 달성률(%) */
  progress: number;
  productImageUrl: string;
  productName: string;
  /** "YYYY-MM-DD" */
  startDate: string;
  /** "YYYY-MM-DD" */
  endDate: string;
  /** 좌측 상단 X. 호출하는 쪽에서 /home으로 보낸다 */
  onClose: () => void;
};

// 서프라이즈가 마감되면 개설자에게 보이는 "선물 준비 완료" 화면
// TODO: 아직 스토리·테스트에서만 쓰인다. 마감 후 개설자 진입점(홈 카드 등)이 정해지면 연결한다
export default function SurpriseReadySheet({
  open,
  shareKey,
  recipientName,
  revealDateLabel,
  contributorCount,
  progress,
  productImageUrl,
  productName,
  startDate,
  endDate,
  onClose,
}: SurpriseReadySheetProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const cardRef = useRef<HTMLDivElement>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const failTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { toast, share } = useShareLink();

  useEffect(() => () => clearTimeout(failTimerRef.current), []);

  const handleSave = async () => {
    if (!cardRef.current) return;
    try {
      await saveNodeAsImage(cardRef.current, `${recipientName}-선물-준비-완료.png`);
    } catch {
      setSaveFailed(true);
      clearTimeout(failTimerRef.current);
      failTimerRef.current = setTimeout(() => setSaveFailed(false), SAVE_FAIL_TOAST_MS);
    }
  };

  const handleShare = () =>
    share({
      title: `${recipientName}님 서프라이즈 펀딩`,
      url: `${window.location.origin}/share/${shareKey}`,
    });

  return (
    <OpenSheet
      open={open}
      title=""
      ariaLabel="선물 준비 완료"
      closeType="close-left"
      onClose={onClose}
      headerAction={
        <IconButton
          size="xlarge"
          icon={<IconDownload />}
          aria-label="이미지로 저장"
          onClick={handleSave}
        />
      }>
      <Title
        title="선물 준비 완료!"
        description={`${revealDateLabel}에 ${recipientName}에게 공개돼요\n함께한 친구 ${contributorCount}명에게 알렸어요`}
      />
      <div className="flex w-full flex-1 items-center justify-center pb-[calc(7rem+env(safe-area-inset-bottom))]">
        {/* 저장되는 이미지는 이 틀 그대로라 흰 배경과 둥근 모서리를 여기서 정한다 */}
        <div
          ref={cardRef}
          className="bg-semantic-fill-default h-94 w-80 shrink-0 overflow-clip rounded-[32px]">
          <FundingBragCard
            title={`쉿!\n${recipientName} 선물 준비 완료!`}
            ariaLabel={`${recipientName}님을 위한 선물 준비 완료`}
            productImageUrl={productImageUrl}
            productName={productName}
            deadline={endDate}
            productCaption={`${formatDeadlineShort(startDate)} ~ ${formatDeadlineShort(endDate)}`}
            badge={
              <Badge
                color="brand"
                size="medium"
                label={`${progress}% 달성`}
                className="rounded-full"
              />
            }
            showProfile={false}
            reduceMotion={reduceMotion}
          />
        </div>
      </div>
      <BottomCTA>
        <Button color="brand" size="xlarge" onClick={handleShare}>
          공유하기
        </Button>
      </BottomCTA>
      <ToastMessage
        show={saveFailed || toast !== null}
        state={!saveFailed && toast === "success"}
        text={
          saveFailed
            ? "이미지를 저장하지 못했어요"
            : toast === "fail"
              ? "링크를 복사하지 못했어요"
              : "링크를 복사했어요"
        }
      />
    </OpenSheet>
  );
}
