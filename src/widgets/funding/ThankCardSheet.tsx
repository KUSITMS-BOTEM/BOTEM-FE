"use client";

import { useState } from "react";

import Dialog from "@/components/Dialog";
import OpenSheet from "@/components/OpenSheet";
import type { Color } from "@/constants/color";
import { useSendThankCardMutation } from "@/hooks/mutations/contribution/useSendThankCardMutation";
import { ApiError } from "@/types/api";
import type { ThankCardPaperColor } from "@/types/contribution/contribution";
import ThankCardSentStep from "@/widgets/funding/ThankCardSentStep";
import ThankCardWriteStep from "@/widgets/funding/ThankCardWriteStep";

type ThankCardSheetProps = {
  open: boolean;
  fundingId: number;
  contributionId: number;
  recipientName: string;
  onClose: () => void;
  // 입금이 확인되지 않은 보탬이라 카드를 보낼 수 없을 때, 안내 Dialog 확인 뒤 호출된다
  onDepositUnconfirmed: () => void;
};

const DEPOSIT_UNCONFIRMED_CODE = "FUNDING_049";

export default function ThankCardSheet({
  open,
  fundingId,
  contributionId,
  recipientName,
  onClose,
  onDepositUnconfirmed,
}: ThankCardSheetProps) {
  const [step, setStep] = useState<"write" | "sent">("write");
  const [color, setColor] = useState<Color>("orange");
  const [message, setMessage] = useState("");
  const [isDepositNoticeOpen, setIsDepositNoticeOpen] = useState(false);
  const { mutate, isPending } = useSendThankCardMutation();
  const isSent = step === "sent";

  const handleSend = () => {
    mutate(
      {
        fundingId,
        contributionId,
        message: message.trim(),
        paperColor: color.toUpperCase() as ThankCardPaperColor,
      },
      {
        onSuccess: () => setStep("sent"),
        onError: error => {
          if (error instanceof ApiError && error.code === DEPOSIT_UNCONFIRMED_CODE) {
            setIsDepositNoticeOpen(true);
          }
        },
      },
    );
  };

  return (
    <>
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
            isSending={isPending}
            onSend={handleSend}
          />
        )}
      </OpenSheet>
      <Dialog
        kind="alert"
        open={isDepositNoticeOpen}
        title="입금을 먼저 확인해주세요"
        onConfirm={() => {
          setIsDepositNoticeOpen(false);
          onDepositUnconfirmed();
        }}
      />
    </>
  );
}
