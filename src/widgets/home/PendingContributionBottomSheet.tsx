"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import ToastMessage from "@/components/ToastMessage";
import Title from "@/components/Title";
import { useUpdateContributionStatusMutation } from "@/hooks/mutations/contribution/useUpdateContributionStatusMutation";
import { usePendingContributionsQuery } from "@/hooks/queries/contribution/usePendingContributionsQuery";
import type {
  ContributionStatus,
  PendingContributionResponse,
} from "@/types/contribution/contribution";
import PendingContributionList from "@/widgets/home/PendingContributionList";
import IconRight from "@/assets/icons/icon-right.svg?react";

const TOAST_DURATION_MS = 2500;

type ContributionToast = Pick<PendingContributionResponse, "contributionId" | "senderName"> & {
  status: Extract<ContributionStatus, "CONFIRMED" | "REJECTED">;
};

type PendingContributionBottomSheetProps = {
  open: boolean;
  fundingId: number | null;
  onClose: () => void;
  onCheckToss?: () => void;
  onOpenFunding?: () => void;
};

export default function PendingContributionBottomSheet({
  open,
  fundingId,
  onClose,
  onCheckToss,
  onOpenFunding,
}: PendingContributionBottomSheetProps) {
  const query = usePendingContributionsQuery({ fundingId, enabled: open });
  const { mutate } = useUpdateContributionStatusMutation(fundingId);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [toasts, setToasts] = useState<ContributionToast[]>([]);
  const toastTimersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const lockRef = useRef(false);
  const contributions = query.data?.contributions;
  const count = contributions?.length ?? 0;
  const hasSelection = selectedIds.length > 0;

  useEffect(() => {
    const timers = toastTimersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const dismissToast = (contributionId: number) => {
    clearTimeout(toastTimersRef.current.get(contributionId));
    toastTimersRef.current.delete(contributionId);
    setToasts(prev => prev.filter(toast => toast.contributionId !== contributionId));
  };

  // 처리한 보탬마다 토스트를 하나씩 아래에 덧붙이고, 각자 시간이 지나면 사라진다
  const showToasts = (updated: ContributionToast[]) => {
    const ids = updated.map(toast => toast.contributionId);
    setToasts(prev => [...prev.filter(toast => !ids.includes(toast.contributionId)), ...updated]);
    ids.forEach(id => {
      clearTimeout(toastTimersRef.current.get(id));
      toastTimersRef.current.set(
        id,
        setTimeout(() => dismissToast(id), TOAST_DURATION_MS),
      );
    });
  };

  const clearToasts = () => {
    toastTimersRef.current.forEach(clearTimeout);
    toastTimersRef.current.clear();
    setToasts([]);
  };

  // 받았어요 직후 취소하기를 연타하거나 두 버튼을 연달아 눌러도 요청이 한 번만 나가게 잠근다
  const updateStatus = (
    contributionIds: number[],
    status: ContributionStatus,
    onSuccess?: () => void,
  ) => {
    if (lockRef.current) return;
    lockRef.current = true;
    mutate({ contributionIds, status }, { onSuccess, onSettled: () => (lockRef.current = false) });
  };

  const handleReceived = () => {
    const received = (contributions ?? []).filter(c => selectedIds.includes(c.contributionId));
    updateStatus(selectedIds, "CONFIRMED", () => {
      setSelectedIds([]);
      showToasts(received.map(contribution => ({ ...contribution, status: "CONFIRMED" })));
    });
  };

  const handleNotReceived = () => {
    const rejected = (contributions ?? []).filter(c => selectedIds.includes(c.contributionId));
    updateStatus(selectedIds, "REJECTED", () => {
      setSelectedIds([]);
      showToasts(rejected.map(contribution => ({ ...contribution, status: "REJECTED" })));
    });
  };

  const handleUndo = (contributionId: number) =>
    updateStatus([contributionId], "PENDING", () => dismissToast(contributionId));

  const handleClose = () => {
    setSelectedIds([]);
    clearToasts();
    onClose();
  };

  const toggleAll = (checked: boolean) =>
    setSelectedIds(checked ? (contributions ?? []).map(c => c.contributionId) : []);

  return (
    <BottomSheet
      open={open}
      title="입금 확인"
      height="auto"
      onClose={handleClose}
      toast={
        <div className="flex w-full flex-col items-center gap-2">
          <AnimatePresence initial={false}>
            {toasts.map(({ contributionId, senderName, status }) => (
              <motion.div
                key={contributionId}
                layout
                exit={{ opacity: 0, y: 8, transition: { duration: 0.2, ease: "easeOut" } }}
                className="w-full max-w-80">
                <ToastMessage
                  show
                  text={
                    status === "CONFIRMED"
                      ? `${senderName}의 보탬을 받았어요`
                      : `${senderName}의 보탬을 못 받은 걸로 표시했어요`
                  }
                  showButton
                  buttonText="취소하기"
                  onButtonClick={() => handleUndo(contributionId)}
                  className="w-full"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      }
      buttons={{
        leftLabel: "못받았어요",
        rightLabel: "받았어요",
        onLeftClick: handleNotReceived,
        onRightClick: handleReceived,
        leftDisabled: !hasSelection,
        rightDisabled: !hasSelection,
        upper: (
          <CheckBox
            label="전체 선택"
            checked={count > 0 && selectedIds.length === count}
            onChange={event => toggleAll(event.target.checked)}
          />
        ),
      }}>
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col items-start gap-4 pt-2 pb-5">
          <Title
            type="a2z"
            title="공개 전에 확인해주세요"
            description={
              contributions &&
              (count > 0
                ? `확인이 필요한 보탬이 ${count}건 있어요.`
                : "확인이 필요한 보탬을 모두 확인했어요.")
            }
            className="p-0"
          />
          <Button
            color="brand"
            variant="weak"
            size="small"
            rightIcon={<IconRight />}
            className="pl-3"
            onClick={onCheckToss}>
            토스 확인하기
          </Button>
        </div>
        <PendingContributionList
          contributions={contributions}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          onOpenFunding={onOpenFunding}
        />
      </div>
    </BottomSheet>
  );
}
