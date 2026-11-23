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
  const [color, setColor] = useState<Color>("orange");
  const [message, setMessage] = useState("");
  // 요청 중에도 입력을 바꿀 수 있어, 완료 화면은 보낸 시점의 값을 보여준다
  const [sentCard, setSentCard] = useState<{ color: Color; message: string } | null>(null);
  const [isDepositNoticeOpen, setIsDepositNoticeOpen] = useState(false);
  const { mutate, isPending } = useSendThankCardMutation();
  const isSent = sentCard !== null;

  const handleSend = () => {
    const card = { color, message: message.trim() };
    mutate(
      {
        fundingId,
        contributionId,
        message: card.message,
        paperColor: card.color.toUpperCase() as ThankCardPaperColor,
      },
      {
        onSuccess: () => setSentCard(card),
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
        {sentCard ? (
          <ThankCardSentStep
            recipientName={recipientName}
            color={sentCard.color}
            message={sentCard.message}
          />
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
