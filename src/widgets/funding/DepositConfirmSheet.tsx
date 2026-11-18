"use client";

import { useEffect, useRef, useState } from "react";

import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import DepositConfirmedAnimation from "@/components/effects/DepositConfirmedAnimation";
import ListHeader from "@/components/ListHeader";
import ToastMessage from "@/components/ToastMessage";
import {
  type DepositAction,
  type DepositItem,
  formatDepositTime,
  getDepositToastText,
  groupDepositsByDate,
} from "@/utils/funding/depositConfirm";
import { formatWon } from "@/utils/funding/giftChangeAmount";
import { openTossApp } from "@/utils/funding/openTossApp";
import PendingContributionItem from "@/widgets/home/PendingContributionItem";
import IconRight from "@/assets/icons/icon-right.svg?react";
import IconDeposit from "@/assets/icons/multicolor/icon-deposit.svg?react";

const TOAST_DURATION_MS = 2500;
const TOSS_FALLBACK_MESSAGE = "모바일에서 토스 앱을 열어 입금 내역을 확인해주세요";

type DepositToast = {
  text: string;
  show: boolean;
  // 있으면 '실행 취소'로 되돌릴 수 있는 처리 결과, 없으면 단순 안내
  undoIds?: number[];
};

type DepositConfirmSheetProps = {
  open: boolean;
  deposits: DepositItem[];
  onClose: () => void;
};

export default function DepositConfirmSheet({ open, deposits, onClose }: DepositConfirmSheetProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // TODO(API): 지금은 처리 결과를 화면 상태에만 둔다. 서버 요청 연동은 handleClose 주석 참고
  const [processedIds, setProcessedIds] = useState<number[]>([]);
  const [toast, setToast] = useState<DepositToast | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const pendingDeposits = deposits.filter(deposit => !processedIds.includes(deposit.id));
  const count = pendingDeposits.length;
  const groups = groupDepositsByDate(pendingDeposits);
  const hasSelection = selectedIds.length > 0;

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const showToast = (next: Omit<DepositToast, "show">) => {
    clearTimeout(toastTimerRef.current);
    setToast({ ...next, show: true });
    toastTimerRef.current = setTimeout(
      () => setToast(prev => prev && { ...prev, show: false }),
      TOAST_DURATION_MS,
    );
  };

  const handleProcess = (action: DepositAction) => {
    setProcessedIds(prev => [...prev, ...selectedIds]);
    setSelectedIds([]);
    showToast({
      text: getDepositToastText(action, selectedIds.length, count),
      undoIds: selectedIds,
    });
  };

  // 실행 취소는 토스트가 떠 있는 동안만 가능하다. 사라지거나 다른 처리가 덮어쓰면 확정된 것으로 본다
  const handleUndo = (undoIds: number[]) => {
    clearTimeout(toastTimerRef.current);
    setProcessedIds(prev => prev.filter(id => !undoIds.includes(id)));
    setToast(prev => prev && { ...prev, show: false });
  };

  const handleCheckToss = async () => {
    const opened = await openTossApp();
    if (!opened) showToast({ text: TOSS_FALLBACK_MESSAGE });
  };

  const handleClose = () => {
    // TODO(API): 처리 결과를 언제 서버에 보낼지 백엔드와 상의해 정한다.
    // - 현재 UI는 '받았어요/못받았어요'를 누르는 즉시 처리된 것처럼 보이고, 실행 취소로 목록을 되돌린다.
    // - 방안 A: 처리 요청(PATCH /api/fundings/{fundingId}/contributions/status)은 즉시 보내고,
    //   실행 취소는 같은 API로 status를 PENDING으로 되돌린다. 백엔드에 PENDING 복귀를 허용하는지 확인이 필요하다
    //   (홈의 PendingContributionBottomSheet는 이 방식으로 취소하고 있다).
    // - 방안 B: 취소용 API가 없으면 처리 요청을 미뤄 두고, 토스트가 사라질 때 또는 이 시트를 닫을 때
    //   뒤늦게 한 번에 보낸다. 이 경우 요청 전에 앱이 종료되거나 네트워크가 끊기면 처리가 유실되므로
    //   닫기 직전 flush 실패 시 사용자에게 알릴지도 정해야 한다.
    clearTimeout(toastTimerRef.current);
    setSelectedIds([]);
    setToast(null);
    onClose();
  };

  const toggle = (id: number, checked: boolean) =>
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id),
    );

  const toastNode =
    toast &&
    (toast.undoIds ? (
      <ToastMessage
        show={toast.show}
        text={toast.text}
        showButton
        buttonText="실행 취소"
        onButtonClick={() => handleUndo(toast.undoIds ?? [])}
      />
    ) : (
      <ToastMessage show={toast.show} text={toast.text} />
    ));

  return (
    <BottomSheet
      open={open}
      title="입금 확인"
      height="auto"
      onClose={handleClose}
      toast={toastNode}
      buttons={{
        leftLabel: "못받았어요",
        rightLabel: "받았어요",
        onLeftClick: () => handleProcess("notReceived"),
        onRightClick: () => handleProcess("received"),
        leftDisabled: !hasSelection,
        rightDisabled: !hasSelection,
        upper: (
          <CheckBox
            label="전체 선택"
            disabled={count === 0}
            checked={count > 0 && selectedIds.length === count}
            onChange={event =>
              setSelectedIds(event.target.checked ? pendingDeposits.map(({ id }) => id) : [])
            }
          />
        ),
      }}>
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col items-start gap-4 pt-2 pb-5">
          <div className="flex w-full flex-col gap-2">
            <h3 className="text-semantic-text-strong [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-title-a2-z-large)]">
              입금 확인{" "}
              <span className={count > 0 ? "text-semantic-text-brand" : undefined}>{count}건</span>
            </h3>
            <p className="text-semantic-text-secondary [letter-spacing:var(--letter-spacing-default)] whitespace-pre-line [font:var(--semantic-subtext-large)]">
              {
                "통장에 실제로 들어온 것만 눌러 받았어요를 눌러주세요.\n입금 전에 누르면 진행률이 그대로 올라가요."
              }
            </p>
          </div>
          <Button
            color="brand"
            variant="weak"
            size="small"
            rightIcon={<IconRight />}
            className="pl-3"
            onClick={handleCheckToss}>
            토스 확인하기
          </Button>
        </div>
        {count === 0 ? (
          <div className="flex min-h-[268px] w-full flex-col items-center justify-center gap-3">
            <DepositConfirmedAnimation />
            <p className="text-semantic-text-quaternary [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-small)]">
              모든 내역을 확인했어요
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-3">
            {groups.map(({ dateLabel, deposits: groupDeposits }) => (
              <section key={dateLabel} className="flex w-full flex-col gap-1">
                <ListHeader title={dateLabel} as="h4" />
                <ul className="flex w-full flex-col gap-3">
                  {groupDeposits.map(({ id, senderName, amount, depositedAt }) => (
                    <li key={id}>
                      <PendingContributionItem
                        senderName={senderName}
                        depositMethod={formatDepositTime(depositedAt)}
                        leading={<IconDeposit aria-hidden />}
                        right={
                          <span className="text-semantic-text-primary w-[95px] truncate text-right [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-medium)]">
                            {formatWon(amount)}
                          </span>
                        }
                        checked={selectedIds.includes(id)}
                        onCheckedChange={checked => toggle(id, checked)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
