"use client";

import { useEffect, useRef, useState } from "react";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import ListText from "@/components/ListText";
import OpenSheet from "@/components/OpenSheet";
import ToastMessage from "@/components/ToastMessage";
import { BANKS, type BankCode } from "@/constants/bank";

const TOAST_DURATION_MS = 2000;

export type FundingTransferAccount = {
  bank: BankCode;
  accountHolder: string;
  accountNumber: string;
};

type FundingTransferGuideSheetProps = {
  open: boolean;
  hostName: string;
  // FundingContributeSheet에서 입력한 보탬 금액
  amount: number;
  account: FundingTransferAccount;
  onClose: () => void;
  onComplete: () => void | Promise<unknown>;
  // 송금 확인 요청 중이면 완료하기에 로딩을 보여준다
  isPending?: boolean;
  // 보태기가 아닌 송금(서프라이즈 주최자 → 받는 사람)에서 문구를 바꿔 쓴다
  sheetTitle?: string;
  description?: string;
  className?: string;
};

export default function FundingTransferGuideSheet({
  open,
  hostName,
  amount,
  account,
  onClose,
  onComplete,
  isPending = false,
  sheetTitle = "보태러 가기",
  description = "송금 후 보탬으로 다시 돌아와서\n완료하기를 눌러야지 보태기가 완료돼요",
  className,
}: FundingTransferGuideSheetProps) {
  const [transferred, setTransferred] = useState(false);
  const [copyResult, setCopyResult] = useState<"success" | "fail" | null>(null);
  const bank = BANKS.find(item => item.code === account.bank);
  const bankName = bank?.name ?? "";

  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const completeLockRef = useRef(false);
  // 시트가 닫히거나 언마운트될 때 올려서, 대기 중이던 복사 완료가 이전 세션의 토스트를 띄우지 않게 한다
  const copySessionRef = useRef(0);

  // 닫히는 경로(뒤로가기·ESC·완료 후 부모가 닫음)와 상관없이 다음에 열 때 처음 상태로 시작한다
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setTransferred(false);
      setCopyResult(null);
    }
  }

  useEffect(() => {
    if (!open) {
      completeLockRef.current = false;
      copySessionRef.current += 1;
    }
  }, [open]);

  useEffect(
    () => () => {
      clearTimeout(toastTimerRef.current);
      copySessionRef.current += 1;
    },
    [],
  );

  // 같은 결과를 연속으로 복사해도 매번 표시 시간을 다시 잰다
  const showCopyResult = (result: "success" | "fail") => {
    setCopyResult(result);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setCopyResult(null), TOAST_DURATION_MS);
  };

  const handleCopy = async () => {
    const session = copySessionRef.current;
    let result: "success" | "fail" = "success";
    try {
      await navigator.clipboard.writeText(`${bankName} ${account.accountNumber}`);
    } catch {
      // 권한 거부·비보안 컨텍스트에서는 복사가 실패한다
      result = "fail";
    }
    if (session !== copySessionRef.current) return;
    showCopyResult(result);
  };

  // 연타·부모가 닫기 전 재클릭으로 onComplete가 두 번 불리지 않게 동기 잠금을 건다. 실패(reject·throw)하면 다시 누를 수 있게 푼다
  const handleComplete = async () => {
    if (completeLockRef.current) return;
    completeLockRef.current = true;
    try {
      await onComplete();
    } catch {
      completeLockRef.current = false;
    }
  };

  return (
    <OpenSheet
      open={open}
      title={sheetTitle}
      onClose={onClose}
      closeType="back"
      className={className}
      overlay={
        <ToastMessage
          show={copyResult !== null}
          state={copyResult === "success"}
          text={copyResult === "fail" ? "복사하지 못했어요" : "계좌번호를 복사했어요"}
          className="pointer-events-none absolute bottom-44 left-1/2 -translate-x-1/2"
        />
      }>
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-col gap-2 pt-2 pb-5 tracking-(--letter-spacing-default)">
          <h1 className="text-semantic-text-strong whitespace-pre-line [font:var(--semantic-title-a2-z-large)]">
            {`${hostName}의 계좌로\n`}
            <span className="text-semantic-text-brand">{amount.toLocaleString("ko-KR")}원</span>
            {`을\n보내주세요`}
          </h1>
          <p className="text-semantic-text-secondary whitespace-pre-line [font:var(--semantic-subtext-large)]">
            {description}
          </p>
        </div>
        <div className="bg-semantic-fill-neutral-weak rounded-xx-large flex items-center gap-3 px-3 py-2">
          <span className="bg-semantic-fill-default rounded-large flex size-10 shrink-0 items-center justify-center">
            {bank?.logo}
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-3 py-3">
            <ListText
              type="price"
              titleUp
              title={`${bankName} ${account.accountNumber}`}
              description={account.accountHolder}
              className="flex-1"
            />
            <Button color="neutral" variant="stroke" size="small" onClick={handleCopy}>
              계좌복사
            </Button>
          </div>
        </div>
      </div>
      <BottomCTA
        upper={
          <CheckBox
            label="송금했어요"
            checked={transferred}
            onChange={event => setTransferred(event.target.checked)}
          />
        }>
        <Button
          color="brand"
          size="xlarge"
          disabled={!transferred}
          states={isPending ? "loading" : "default"}
          onClick={handleComplete}>
          완료하기
        </Button>
      </BottomCTA>
    </OpenSheet>
  );
}
