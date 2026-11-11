"use client";

import { useState } from "react";

import Dialog from "@/components/Dialog";
import OpenSheet from "@/components/OpenSheet";
import type { WishResponse } from "@/types/wish/wish";
import { cn } from "@/utils/cn";
import FundingAccountStep from "@/widgets/funding/FundingAccountStep";
import FundingInfoStep from "@/widgets/funding/FundingInfoStep";
import FundingWishSelectStep from "@/widgets/funding/FundingWishSelectStep";

type FundingOpenSheetProps = {
  open: boolean;
  onClose: () => void;
  className?: string;
};

type Step = "info" | "account";

const STEP_TITLE: Record<Step, string> = { info: "펀딩 정보", account: "계좌 정보" };

export default function FundingOpenSheet({ open, onClose, className }: FundingOpenSheetProps) {
  const [selectedWish, setSelectedWish] = useState<WishResponse | null>(null);
  const [step, setStep] = useState<Step>("info");
  // 계좌 단계는 처음 진입할 때 마운트해 대표 계좌 조회와 등장 모션이 그때 시작되게 한다
  const [accountVisited, setAccountVisited] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  // 시트를 닫으면 다음에 열 때 위시 선택부터 다시 시작한다
  const handleClose = () => {
    setSelectedWish(null);
    setStep("info");
    setAccountVisited(false);
    onClose();
  };

  // 위시를 고른 뒤에는 입력한 정보가 사라지므로 확인을 받고, 고르기 전에는 바로 닫는다
  const handleRequestClose = () => (selectedWish ? setLeaveOpen(true) : handleClose());

  const handleLeave = () => {
    setLeaveOpen(false);
    handleClose();
  };

  const goToAccount = () => {
    setAccountVisited(true);
    setStep("account");
  };

  return (
    <>
      <OpenSheet
        open={open}
        title={selectedWish ? STEP_TITLE[step] : "펀딩 열기"}
        onClose={handleRequestClose}
        className={className}>
        {selectedWish ? (
          // 이전으로 돌아왔을 때 입력값·단계가 남도록 언마운트하지 않고 숨기기만 한다
          <>
            <div className={cn("w-full", step !== "info" && "hidden")}>
              <FundingInfoStep wish={selectedWish} onNext={goToAccount} />
            </div>
            {accountVisited && (
              <div className={cn("w-full", step !== "account" && "hidden")}>
                <FundingAccountStep onPrev={() => setStep("info")} />
              </div>
            )}
          </>
        ) : (
          <FundingWishSelectStep onSelect={setSelectedWish} />
        )}
      </OpenSheet>
      <Dialog
        kind="confirm"
        open={leaveOpen}
        title="펀딩 만들기를 그만둘까요?"
        description="지금까지 입력한 내용은 저장되지 않아요."
        cancelLabel="계속 만들기"
        confirmLabel="그만두기"
        confirmColor="neutral"
        onCancel={() => setLeaveOpen(false)}
        onConfirm={handleLeave}
      />
    </>
  );
}
