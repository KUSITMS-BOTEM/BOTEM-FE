"use client";

import { useState } from "react";

import OpenSheet from "@/components/OpenSheet";
import type { Color } from "@/constants/color";
import { useSendThankCardMutation } from "@/hooks/mutations/contribution/useSendThankCardMutation";
import type { ThankCardPaperColor } from "@/types/contribution/contribution";
import ThankCardSentStep from "@/widgets/funding/ThankCardSentStep";
import ThankCardWriteStep from "@/widgets/funding/ThankCardWriteStep";

type ThankCardSheetProps = {
  open: boolean;
  fundingId: number;
  contributionId: number;
  recipientName: string;
  onClose: () => void;
};

// 보내기는 미리보기(완료 화면)로 넘어가기만 하고, 실제 전송은 친구에게 공유하기에서 한다
export default function ThankCardSheet({
  open,
  fundingId,
  contributionId,
  recipientName,
  onClose,
}: ThankCardSheetProps) {
  const [step, setStep] = useState<"write" | "sent">("write");
  const [color, setColor] = useState<Color>("orange");
  const [message, setMessage] = useState("");
  const { mutate, isPending } = useSendThankCardMutation();
  const isSent = step === "sent";

  const handleShare = () => {
    mutate(
      {
        fundingId,
        contributionId,
        message: message.trim(),
        paperColor: color.toUpperCase() as ThankCardPaperColor,
      },
      // TODO: 공유 화면이 확정되면 응답의 shareUrl로 공유 화면에 연결한다
      { onSuccess: onClose },
    );
  };

  return (
    <OpenSheet
      open={open}
      title={isSent ? "" : "감사 카드"}
      ariaLabel="감사 카드"
      onClose={onClose}>
      {isSent ? (
        <ThankCardSentStep
          recipientName={recipientName}
          color={color}
          message={message.trim()}
          isSharing={isPending}
          onShare={handleShare}
        />
      ) : (
        <ThankCardWriteStep
          recipientName={recipientName}
          color={color}
          onColorChange={setColor}
          message={message}
          onMessageChange={setMessage}
          onSend={() => setStep("sent")}
        />
      )}
    </OpenSheet>
  );
}
