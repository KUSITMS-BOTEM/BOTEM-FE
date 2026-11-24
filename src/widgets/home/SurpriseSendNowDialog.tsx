"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Dialog from "@/components/Dialog";
import { useCloseFundingMutation } from "@/hooks/mutations/funding/useCloseFundingMutation";

type SurpriseSendNowDialogProps = {
  // null이면 닫힌 상태다
  fundingId: number | null;
  onClose: () => void;
};

// 마감 전에 목표를 채운 서프라이즈. 지금 보내면 조기 마감한 뒤 선물 준비 화면으로 가고, 마감일에 보내면 그대로 둔다
export default function SurpriseSendNowDialog({ fundingId, onClose }: SurpriseSendNowDialogProps) {
  const router = useRouter();
  const { mutate: closeFunding, isPending } = useCloseFundingMutation();
  // isPending은 다음 렌더에야 반영돼 연타를 못 막으므로 클릭 즉시 잠근다. 실패 때만 푼다
  const [submitting, setSubmitting] = useState(false);

  const handleSendNow = () => {
    if (fundingId === null || submitting) return;
    setSubmitting(true);
    closeFunding(fundingId, {
      onSuccess: () => router.push(`/funding/${fundingId}/surprise-gift`),
      onError: () => setSubmitting(false),
    });
  };

  const handleCancel = () => {
    // 요청 중에 닫으면 취소한 줄 아는 사용자가 성공 뒤 갑자기 이동하게 된다
    if (submitting) return;
    onClose();
  };

  return (
    <Dialog
      kind="confirm"
      open={fundingId !== null}
      title="지금 선물을 보낼까요?"
      description={
        "지금 보내면 펀딩이 바로 마감돼요.\n마감일에 보내면 그때까지 계속 모을 수 있어요"
      }
      confirmLabel="지금 보내기"
      cancelLabel="마감일에 보낼게요"
      confirmColor="neutral"
      isPending={isPending || submitting}
      onConfirm={handleSendNow}
      onCancel={handleCancel}
    />
  );
}
