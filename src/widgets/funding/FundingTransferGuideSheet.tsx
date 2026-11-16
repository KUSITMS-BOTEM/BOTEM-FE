"use client";

import { useEffect, useState } from "react";

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
  onComplete: () => void;
  className?: string;
};

export default function FundingTransferGuideSheet({
  open,
  hostName,
  amount,
  account,
  onClose,
  onComplete,
  className,
}: FundingTransferGuideSheetProps) {
  const [transferred, setTransferred] = useState(false);
  const [copyResult, setCopyResult] = useState<"success" | "fail" | null>(null);
  const bank = BANKS.find(item => item.code === account.bank);
  const bankName = bank?.name ?? "";

  useEffect(() => {
    if (!copyResult) return;
    const timer = setTimeout(() => setCopyResult(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [copyResult]);

  // 시트를 닫으면 다음에 열 때 체크 해제 상태로 시작한다
  const handleClose = () => {
    setTransferred(false);
    setCopyResult(null);
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${bankName} ${account.accountNumber}`);
      setCopyResult("success");
    } catch {
      // 권한 거부·비보안 컨텍스트에서는 복사가 실패한다
      setCopyResult("fail");
    }
  };

  return (
    <OpenSheet
      open={open}
      title="보태러 가기"
      onClose={handleClose}
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
            {"송금 후 보탬으로 다시 돌아와서\n완료하기를 눌러야지 보태기가 완료돼요"}
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
        <Button color="brand" size="xlarge" disabled={!transferred} onClick={onComplete}>
          완료하기
        </Button>
      </BottomCTA>
    </OpenSheet>
  );
}
