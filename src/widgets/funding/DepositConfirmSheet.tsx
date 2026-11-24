"use client";

import { useEffect, useRef, useState } from "react";

import BottomSheet, { type BottomSheetEnterTransition } from "@/components/BottomSheet";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import DepositConfirmedAnimation from "@/components/effects/DepositConfirmedAnimation";
import ListHeader from "@/components/ListHeader";
import ListText from "@/components/ListText";
import ShimmerBar from "@/components/skeleton/ShimmerBar";
import ToastMessage from "@/components/ToastMessage";
import { useDecideContributionsMutation } from "@/hooks/mutations/contribution/useDecideContributionsMutation";
import { useUndoContributionDecisionsMutation } from "@/hooks/mutations/contribution/useUndoContributionDecisionsMutation";
import { usePendingContributionsQuery } from "@/hooks/queries/contribution/usePendingContributionsQuery";
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
const SKELETON_COUNT = 2;

type DepositToast = {
  text: string;
  show: boolean;
  // 있으면 처리 결과 토스트라 '실행 취소' 버튼을 붙이고, 누르면 이 참여들을 되돌린다
  undo?: { fundingId: number; contributionIds: number[] };
};

// preReveal: 마감 후 공개 전에 남은 입금을 확인하는 시트라, 모두 확인하면 공개 화면으로 보낼 수 있다
type DepositConfirmSheetVariantProps =
  | { variant?: "default"; onReveal?: never; revealLabel?: never }
  | { variant: "preReveal"; onReveal: () => void; revealLabel?: string };

type DepositConfirmSheetProps = DepositConfirmSheetVariantProps & {
  open: boolean;
  fundingId: number | null;
  onClose: () => void;
  enterTransition?: BottomSheetEnterTransition;
};

export default function DepositConfirmSheet({
  open,
  fundingId,
  onClose,
  enterTransition,
  variant = "default",
  onReveal,
  revealLabel = "팡! 열어보기",
}: DepositConfirmSheetProps) {
  const isPreReveal = variant === "preReveal";
  const query = usePendingContributionsQuery({ fundingId, enabled: open });
  const decideMutation = useDecideContributionsMutation();
  const undoMutation = useUndoContributionDecisionsMutation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // 클릭 즉시 버튼을 잠근다. isPending은 다음 렌더에야 반영돼 그 사이의 연타를 막지 못한다
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<DepositToast | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  // 닫을 때마다 올린다. 홈은 시트 하나를 카드마다 재사용해, 닫은 뒤 도착한 응답이 다른 카드 시트를 건드리지 않게 한다
  const sessionRef = useRef(0);

  const pendingDeposits: DepositItem[] = (query.data?.contributions ?? []).map(contribution => ({
    id: contribution.contributionId,
    senderName: contribution.participantName,
    depositedAt: contribution.participatedAt,
    amount: contribution.amount,
  }));
  const count = pendingDeposits.length;
  const groups = groupDepositsByDate(pendingDeposits);
  const hasSelection = selectedIds.length > 0;
  const isAllSelected = count > 0 && pendingDeposits.every(({ id }) => selectedIds.includes(id));
  const isBusy = isSubmitting || decideMutation.isPending || undoMutation.isPending;

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const showToast = (next: Omit<DepositToast, "show">) => {
    clearTimeout(toastTimerRef.current);
    setToast({ ...next, show: true });
    toastTimerRef.current = setTimeout(
      () => setToast(prev => prev && { ...prev, show: false }),
      TOAST_DURATION_MS,
    );
  };

  // 누르는 즉시 서버에 반영한다. 선택한 건은 한 요청으로 함께 처리돼 일부만 성공하는 경우가 없다
  const handleProcess = async (action: DepositAction) => {
    if (isBusy || fundingId === null) return;
    // 다른 기기에서 이미 처리돼 목록에서 빠진 건은 다시 보내지 않는다
    const ids = selectedIds.filter(id => pendingDeposits.some(deposit => deposit.id === id));
    if (ids.length === 0) return;
    setIsSubmitting(true);
    const session = sessionRef.current;
    try {
      const data = await decideMutation.mutateAsync({
        fundingId,
        contributionIds: ids,
        decision: action === "received" ? "CONFIRM" : "REJECT",
      });
      if (session !== sessionRef.current) return;
      setSelectedIds([]);
      // 이미 같은 결과였던 참여까지 되돌리면 원래 상태가 바뀌므로 이번에 바뀐 참여만 실행 취소 대상이다
      const undoIds = (data?.contributions ?? [])
        .filter(({ changed }) => changed)
        .map(({ contributionId }) => contributionId);
      showToast({
        text: getDepositToastText(action, ids.length, count),
        undo: undoIds.length > 0 ? { fundingId, contributionIds: undoIds } : undefined,
      });
    } catch {
      // 안내는 전역 MutationCache onError가 맡고, 선택은 그대로 둬 바로 다시 누를 수 있게 한다
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckToss = async () => {
    const opened = await openTossApp();
    if (!opened) showToast({ text: TOSS_FALLBACK_MESSAGE });
  };

  // 실패(10초 경과 등) 안내는 전역 MutationCache onError가 맡는다
  const handleUndo = () => {
    const undo = toast?.undo;
    clearTimeout(toastTimerRef.current);
    setToast(prev => prev && { ...prev, show: false });
    if (undo && !undoMutation.isPending) undoMutation.mutate(undo);
  };

  const handleClose = () => {
    sessionRef.current += 1;
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
    (toast.undo ? (
      <ToastMessage
        show={toast.show}
        text={toast.text}
        showButton
        buttonText="실행 취소"
        onButtonClick={handleUndo}
      />
    ) : (
      <ToastMessage show={toast.show} text={toast.text} />
    ));

  return (
    <BottomSheet
      open={open}
      title="입금 확인"
      height="auto"
      enterTransition={enterTransition}
      onClose={handleClose}
      toast={toastNode}
      buttons={{
        leftLabel: "못받았어요",
        rightLabel: "받았어요",
        onLeftClick: () => handleProcess("notReceived"),
        onRightClick: () => handleProcess("received"),
        leftDisabled: !hasSelection || isBusy,
        rightDisabled: !hasSelection || isBusy,
        rightLoading: isBusy,
        upper: (
          <CheckBox
            label="전체 선택"
            disabled={count === 0 || isBusy}
            checked={isAllSelected}
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
              {isPreReveal ? (
                "공개 전에 확인해주세요"
              ) : (
                <>
                  입금 확인{" "}
                  <span className={count > 0 ? "text-semantic-text-brand" : undefined}>
                    {count}건
                  </span>
                </>
              )}
            </h3>
            {(!isPreReveal || count > 0) && (
              <p className="text-semantic-text-secondary [letter-spacing:var(--letter-spacing-default)] whitespace-pre-line [font:var(--semantic-subtext-large)]">
                {isPreReveal
                  ? `확인이 필요한 보탬이 ${count}건 있어요.`
                  : "통장에 실제로 들어온 것만 눌러 받았어요를 눌러주세요.\n입금 전에 누르면 진행률이 그대로 올라가요."}
              </p>
            )}
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
        <div className="flex w-full flex-col gap-3">
          {isPreReveal && query.data && <ListHeader title={`미확인 보탬 ${count}건`} as="h4" />}
          {query.isLoading ? (
            <div aria-busy className="flex w-full flex-col gap-3">
              {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <ShimmerBar key={index} className="h-[82px] w-full rounded-2xl" />
              ))}
            </div>
          ) : query.isError && !query.data ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
                입금 내역을 불러오지 못했어요
              </p>
              <Button onClick={() => query.refetch()}>다시 시도</Button>
            </div>
          ) : count === 0 ? (
            <div className="flex min-h-[268px] w-full flex-col items-center justify-center gap-3">
              <DepositConfirmedAnimation />
              <p className="text-semantic-text-quaternary [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-small)]">
                모든 내역을 확인했어요
              </p>
              {onReveal && (
                <Button color="neutral" variant="weak" size="medium" onClick={onReveal}>
                  {revealLabel}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex w-full flex-col gap-3">
              {groups.map(({ dateLabel, deposits: groupDeposits }) => (
                <section key={dateLabel} className="flex w-full flex-col gap-1">
                  <ListHeader title={dateLabel} as="h4" />
                  <ul className="flex w-full flex-col gap-3">
                    {groupDeposits.map(({ id, senderName, depositedAt, amount }) => (
                      <li key={id}>
                        <PendingContributionItem
                          senderName={senderName}
                          depositMethod={formatDepositTime(depositedAt)}
                          leading={<IconDeposit aria-hidden />}
                          right={<ListText type="price" align="right" title={formatWon(amount)} />}
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
      </div>
    </BottomSheet>
  );
}
