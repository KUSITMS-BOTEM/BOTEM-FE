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

// 보내기에서 감사 카드를 전송하고, 성공하면 완료 화면에서 카드 이미지를 공유한다
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

  // isPending은 다음 렌더에야 반영돼 더블클릭을 못 막으므로 클릭 즉시 잠근다. 실패 때만 푼다
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (sending) return;
    setSending(true);
    mutate(
      {
        fundingId,
        contributionId,
        message: message.trim(),
        paperColor: color.toUpperCase() as ThankCardPaperColor,
      },
      { onSuccess: () => setStep("sent"), onError: () => setSending(false) },
    );
  };

  return (
    <OpenSheet
      open={open}
      title={isSent ? "" : "감사 카드"}
      ariaLabel="감사 카드"
      onClose={onClose}>
      {isSent ? (
        <ThankCardSentStep recipientName={recipientName} color={color} message={message.trim()} />
      ) : (
        <ThankCardWriteStep
          recipientName={recipientName}
          color={color}
          onColorChange={setColor}
          message={message}
          onMessageChange={setMessage}
          isSending={sending || isPending}
          onSend={handleSend}
        />
      )}
    </OpenSheet>
  );
}
