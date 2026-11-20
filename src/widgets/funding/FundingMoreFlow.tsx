"use client";

import { useState, type ComponentProps } from "react";

import Dialog from "@/components/Dialog";
import { useCloseFundingMutation } from "@/hooks/mutations/funding/useCloseFundingMutation";
import type { FundingManagementActionsResponse } from "@/types/funding/ownerFundingDetail";
import FundingMoreSheet from "@/widgets/funding/FundingMoreSheet";
import FundingOpenCompleteSheet from "@/widgets/funding/FundingOpenCompleteSheet";

// 개설자의 더보기 플로우: 더보기 시트 → 공유 카드 다시 받기 화면 / 조기 마감 확인 Dialog
type FundingMoreFlowProps = {
  open: boolean;
  fundingId: number;
  shareKey: string;
  extended: boolean;
  actions: Pick<FundingManagementActionsResponse, "canCloseEarly" | "canReissueShareCard">;
  shareCard: Pick<
    Extract<ComponentProps<typeof FundingOpenCompleteSheet>, { variant: "funding" }>,
    "cardTitle" | "wish" | "info" | "progress"
  >;
  onClose: () => void;
};

export default function FundingMoreFlow({
  open,
  fundingId,
  shareKey,
  extended,
  actions,
  shareCard,
  onClose,
}: FundingMoreFlowProps) {
  const [isShareCardOpen, setIsShareCardOpen] = useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const { mutate: closeFunding, isPending: isClosing } = useCloseFundingMutation();

  const handleCloseConfirm = () =>
    closeFunding(fundingId, { onSuccess: () => setIsCloseConfirmOpen(false) });

  return (
    <>
      <FundingMoreSheet
        open={open}
        extended={extended}
        canReissueShareCard={actions.canReissueShareCard}
        canCloseEarly={actions.canCloseEarly}
        onClose={onClose}
        onReissueShareCardClick={() => {
          onClose();
          setIsShareCardOpen(true);
        }}
        onCloseEarlyClick={() => {
          onClose();
          setIsCloseConfirmOpen(true);
        }}
      />
      <FundingOpenCompleteSheet
        open={isShareCardOpen}
        variant="funding"
        shareKey={shareKey}
        {...shareCard}
        onClose={() => setIsShareCardOpen(false)}
      />
      <Dialog
        kind="confirm"
        open={isCloseConfirmOpen}
        title="지금 마감할까요?"
        description="마감하면 다시 열 수 없어요"
        confirmColor="danger"
        isPending={isClosing}
        onCancel={() => setIsCloseConfirmOpen(false)}
        onConfirm={handleCloseConfirm}
      />
    </>
  );
}
