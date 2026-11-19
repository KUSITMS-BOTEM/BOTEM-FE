"use client";

import { useEffect, useRef, useState } from "react";

import BottomSheet, { type BottomSheetEnterTransition } from "@/components/BottomSheet";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import DepositConfirmedAnimation from "@/components/effects/DepositConfirmedAnimation";
import ListHeader from "@/components/ListHeader";
import ShimmerBar from "@/components/skeleton/ShimmerBar";
import ToastMessage from "@/components/ToastMessage";
import { useConfirmAllContributionsMutation } from "@/hooks/mutations/contribution/useConfirmAllContributionsMutation";
import { useConfirmContributionMutation } from "@/hooks/mutations/contribution/useConfirmContributionMutation";
import { useRejectContributionMutation } from "@/hooks/mutations/contribution/useRejectContributionMutation";
import { usePendingContributionsQuery } from "@/hooks/queries/contribution/usePendingContributionsQuery";
import {
  type DepositAction,
  type DepositItem,
  formatDepositTime,
  getDepositToastText,
  groupDepositsByDate,
} from "@/utils/funding/depositConfirm";
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
  // true면 처리 결과 토스트라 '실행 취소' 버튼을 붙인다
  undoable?: boolean;
};

// preReveal: 마감 후 공개 전에 남은 입금을 확인하는 시트라, 모두 확인하면 공개 화면으로 보낼 수 있다
type DepositConfirmSheetVariantProps =
  { variant?: "default"; onReveal?: never } | { variant: "preReveal"; onReveal: () => void };

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
}: DepositConfirmSheetProps) {
  const isPreReveal = variant === "preReveal";
  const query = usePendingContributionsQuery({ fundingId, enabled: open });
  const confirmMutation = useConfirmContributionMutation();
  const rejectMutation = useRejectContributionMutation();
  const confirmAllMutation = useConfirmAllContributionsMutation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // 클릭 즉시 버튼을 잠근다. 여러 건을 병렬로 보내면 isPending만으로는 마지막 요청 상태만 보인다
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<DepositToast | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const pendingDeposits: DepositItem[] = (query.data?.contributions ?? []).map(contribution => ({
    id: contribution.contributionId,
    senderName: contribution.participantName,
    depositedAt: contribution.participatedAt,
  }));
  const count = pendingDeposits.length;
  const groups = groupDepositsByDate(pendingDeposits);
  const hasSelection = selectedIds.length > 0;
  const isAllSelected = count > 0 && pendingDeposits.every(({ id }) => selectedIds.includes(id));
  const isBusy =
    isSubmitting ||
    confirmMutation.isPending ||
    rejectMutation.isPending ||
    confirmAllMutation.isPending;

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const showToast = (next: Omit<DepositToast, "show">) => {
    clearTimeout(toastTimerRef.current);
    setToast({ ...next, show: true });
    toastTimerRef.current = setTimeout(
      () => setToast(prev => prev && { ...prev, show: false }),
      TOAST_DURATION_MS,
    );
  };

  // 건별 요청의 성공한 id만 돌려준다. 일부만 실패해도 성공한 건은 이미 서버에 반영됐다
  const requestEach = async (action: DepositAction, targetFundingId: number, ids: number[]) => {
    const mutation = action === "notReceived" ? rejectMutation : confirmMutation;
    const results = await Promise.allSettled(
      ids.map(contributionId =>
        mutation.mutateAsync({ fundingId: targetFundingId, contributionId }),
      ),
    );
    return ids.filter((_, index) => results[index].status === "fulfilled");
  };

  const requestProcess = async (action: DepositAction, targetFundingId: number, ids: number[]) => {
    if (action === "received" && isAllSelected) {
      await confirmAllMutation.mutateAsync(targetFundingId);
      return ids;
    }
    return requestEach(action, targetFundingId, ids);
  };

  // 누르는 즉시 서버에 반영한다. 실행 취소는 되돌리는 API가 없어 지금은 토스트만 닫는다
  const handleProcess = async (action: DepositAction) => {
    if (isBusy || fundingId === null) return;
    // 이전 부분 실패로 선택에 남은 id 중 이미 처리돼 목록에서 빠진 건은 다시 보내지 않는다
    const ids = selectedIds.filter(id => pendingDeposits.some(deposit => deposit.id === id));
    setIsSubmitting(true);
    try {
      const succeededIds = await requestProcess(action, fundingId, ids);
      // 실패한 건은 선택을 유지해 바로 다시 누를 수 있게 둔다. 실패 안내는 전역 MutationCache onError가 맡는다
      setSelectedIds(prev => prev.filter(id => ids.includes(id) && !succeededIds.includes(id)));
      if (succeededIds.length > 0) {
        showToast({
          text: getDepositToastText(action, succeededIds.length, count),
          undoable: true,
        });
      }
    } catch {
      // confirm-all 실패. 안내는 전역 MutationCache onError가 맡고 선택은 그대로 둔다
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckToss = async () => {
    const opened = await openTossApp();
    if (!opened) showToast({ text: TOSS_FALLBACK_MESSAGE });
  };

  // TODO(API): 처리를 되돌리는 API가 생기면 여기서 요청하고 목록을 다시 불러온다
  const handleUndo = () => {
    clearTimeout(toastTimerRef.current);
    setToast(prev => prev && { ...prev, show: false });
  };

  const handleClose = () => {
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
    (toast.undoable ? (
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
                  팡! 열어보기
                </Button>
              )}
            </div>
          ) : (
            <div className="flex w-full flex-col gap-3">
              {groups.map(({ dateLabel, deposits: groupDeposits }) => (
                <section key={dateLabel} className="flex w-full flex-col gap-1">
                  <ListHeader title={dateLabel} as="h4" />
                  <ul className="flex w-full flex-col gap-3">
                    {groupDeposits.map(({ id, senderName, depositedAt }) => (
                      <li key={id}>
                        <PendingContributionItem
                          senderName={senderName}
                          depositMethod={formatDepositTime(depositedAt)}
                          leading={<IconDeposit aria-hidden />}
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
