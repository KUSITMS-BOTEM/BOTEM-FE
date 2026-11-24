"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import ErrorView from "@/components/ErrorView";
import ToastMessage from "@/components/ToastMessage";
import { useCompleteSurpriseGiftPreparationMutation } from "@/hooks/mutations/funding/useCompleteSurpriseGiftPreparationMutation";
import { useSurpriseGiftPreparationQuery } from "@/hooks/queries/funding/useSurpriseGiftPreparationQuery";
import type { SurpriseGiftPreparationResponse } from "@/types/funding/surprise";
import { formatRevealLabel } from "@/utils/funding/formatDeadline";
import { openPendingTab } from "@/utils/openPendingTab";
import DepositConfirmSheet from "@/widgets/funding/DepositConfirmSheet";
import FundingTransferGuideSheet from "@/widgets/funding/FundingTransferGuideSheet";
import SurpriseGiftView from "@/widgets/funding/SurpriseGiftView";
import SurpriseReadySheet from "@/widgets/funding/SurpriseReadySheet";
import SurpriseGiftViewSkeleton from "@/widgets/funding/skeleton/SurpriseGiftViewSkeleton";

const TOAST_DURATION_MS = 2000;

type SurpriseGiftContainerProps = {
  fundingId: string;
};

export default function SurpriseGiftContainer({ fundingId }: SurpriseGiftContainerProps) {
  const id = Number(fundingId);
  const router = useRouter();
  const query = useSurpriseGiftPreparationQuery(id);
  const completeMutation = useCompleteSurpriseGiftPreparationMutation(id);
  // isPending은 다음 렌더에야 반영돼 연타를 못 막으므로 클릭 즉시 잠근다. 요청이 끝나면 푼다
  const [submitting, setSubmitting] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [readyOpen, setReadyOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const preparation = query.data;

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  // 확인 대기가 남아 있으면 선물 준비를 완료할 수 없어(FUNDING_007) 들어오자마자 정리 시트를 띄운다
  const [checkedPending, setCheckedPending] = useState(false);
  if (preparation && !checkedPending) {
    setCheckedPending(true);
    if (preparation.pendingCleanupRequired) setDepositOpen(true);
  }

  const goHome = () => router.replace("/home");

  if (!preparation) {
    if (query.isError || query.isSuccess) {
      return <ErrorView onRetry={() => void query.refetch()} onClose={goHome} />;
    }
    return <SurpriseGiftViewSkeleton />;
  }

  const showToast = (text: string) => {
    setToast(text);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  };

  // 이미 준비를 마쳤으면 다시 요청하지 않는다. 실패하면 null을 돌려주고 안내는 전역 에러 처리에 맡긴다
  const ensurePrepared = async (): Promise<SurpriseGiftPreparationResponse | null> => {
    if (preparation.giftPreparedAt) return preparation;
    try {
      return (await completeMutation.mutateAsync()) ?? null;
    } catch {
      return null;
    }
  };

  const runOnce = async (action: () => Promise<void>) => {
    if (submitting) return;
    if (preparation.pendingCleanupRequired) {
      setDepositOpen(true);
      return;
    }
    setSubmitting(true);
    try {
      await action();
    } finally {
      setSubmitting(false);
    }
  };

  // 구매만으로는 준비를 완료하지 않는다. 사고 돌아와 '선물 준비하기'를 눌러야 완료돼 친구들에게 알림이 간다
  const handleBuy = () => openPendingTab().navigate(preparation.productUrl);

  const handlePrepare = () =>
    runOnce(async () => {
      if (await ensurePrepared()) setReadyOpen(true);
    });

  const handleTransfer = () => {
    if (preparation.pendingCleanupRequired) {
      setDepositOpen(true);
      return;
    }
    if (!preparation.recipientPayoutAccount) {
      showToast(
        preparation.recipientWithdrawn
          ? "탈퇴한 친구라 송금할 수 없어요"
          : "친구가 아직 계좌를 등록하지 않았어요",
      );
      return;
    }
    setTransferOpen(true);
  };

  // 송금은 앱 밖에서 하므로, 돌아와 완료하기를 눌러야 준비를 완료해 친구들에게 알린다.
  // 실패하면 throw해 송금 시트가 완료하기 잠금을 풀고 그대로 남게 한다
  const handleTransferComplete = async () => {
    if (!(await ensurePrepared())) throw new Error("선물 준비 완료 실패");
    setTransferOpen(false);
    setReadyOpen(true);
  };

  const recipientName = preparation.recipientName ?? "";
  const account = preparation.recipientPayoutAccount;

  return (
    <>
      <SurpriseGiftView
        preparation={preparation}
        onClose={goHome}
        onBuy={handleBuy}
        onPrepare={handlePrepare}
        preparePending={submitting}
        onTransfer={handleTransfer}
      />
      <ToastMessage
        show={toast !== null}
        state={false}
        text={toast ?? ""}
        className="fixed bottom-32 left-1/2 -translate-x-1/2"
      />
      <DepositConfirmSheet
        variant="preReveal"
        revealLabel="선물 준비하기"
        open={depositOpen}
        fundingId={id}
        onClose={() => {
          setDepositOpen(false);
          void query.refetch();
        }}
        onReveal={() => {
          setDepositOpen(false);
          void query.refetch();
        }}
      />
      <SurpriseReadySheet
        open={readyOpen}
        recipientName={preparation.recipientName || "친구"}
        revealDateLabel={preparation.revealAt ? formatRevealLabel(preparation.revealAt) : undefined}
        contributorCount={preparation.participantCount}
        progress={preparation.achievementPercentage}
        productImageUrl={preparation.productImageUrl}
        productName={preparation.productName}
        startDate={preparation.fundingStartedAt.slice(0, 10)}
        endDate={preparation.deadline.slice(0, 10)}
        onClose={goHome}
      />
      {account && (
        <FundingTransferGuideSheet
          open={transferOpen}
          hostName={recipientName}
          amount={preparation.confirmedAmount}
          account={{
            bank: account.bank,
            accountHolder: account.accountHolder ?? recipientName,
            accountNumber: account.accountNumber,
          }}
          sheetTitle="송금하기"
          description={"송금한 뒤 돌아와서\n완료하기를 눌러주세요"}
          onClose={() => setTransferOpen(false)}
          onComplete={handleTransferComplete}
          isPending={completeMutation.isPending}
        />
      )}
    </>
  );
}
