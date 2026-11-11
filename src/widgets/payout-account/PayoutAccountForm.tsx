"use client";

import { type ClipboardEvent, useEffect, useState } from "react";

import { motion, MotionConfig } from "framer-motion";

import SelectBox from "@/components/SelectBox";
import TextField from "@/components/TextField";
import Title from "@/components/Title";
import ToastMessage from "@/components/ToastMessage";
import { BANKS, type BankCode } from "@/constants/bank";
import {
  readClipboardText,
  resolveClipboardPasteAction,
} from "@/utils/payout-account/clipboardPaste";
import { parseClipboardAccount } from "@/utils/payout-account/parseClipboardAccount";
import BankSelectBottomSheet from "@/widgets/payout-account/BankSelectBottomSheet";

// Figma "01 모션 토큰" 기준: ease.standard / duration.enter·move / delay.start·stagger / distance.title·field
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.3, duration: 0.45, ease: EASE_STANDARD };
const FIELD_TRANSITION = { delay: 0.8, duration: 0.4, ease: EASE_STANDARD };
const TOAST_DURATION_MS = 2500;

type PayoutAccountFormProps = {
  accountNumber: string;
  bank: BankCode | null;
  onAccountNumberChange: (accountNumber: string) => void;
  onBankChange: (bank: BankCode) => void;
};

// CTA가 폼 밖(BottomCTA)에 있어 값은 부모가 들고, 폼은 입력 UI와 붙여넣기 처리만 맡는다
export default function PayoutAccountForm({
  accountNumber,
  bank,
  onAccountNumberChange,
  onBankChange,
}: PayoutAccountFormProps) {
  const [bankSheetOpen, setBankSheetOpen] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);
  const bankName = BANKS.find(item => item.code === bank)?.name ?? "";

  useEffect(() => {
    if (!toastText) return;
    const timer = setTimeout(() => setToastText(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastText]);

  const handlePasteFromClipboard = async () => {
    const text = await readClipboardText();
    const action = resolveClipboardPasteAction(parseClipboardAccount(text));
    if (action.accountNumber) onAccountNumberChange(action.accountNumber);
    if (action.bankCode) onBankChange(action.bankCode);
    if (action.toastText) setToastText(action.toastText);
  };

  // "은행명 계좌번호" 형식일 때만 가로채 은행까지 채운다. 그 외엔 기본 붙여넣기에 맡겨 숫자만 필터링되게 한다
  const handleAccountNumberPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const action = resolveClipboardPasteAction(
      parseClipboardAccount(event.clipboardData.getData("text")),
    );
    if (!action.bankCode) return;
    event.preventDefault();
    onAccountNumberChange(action.accountNumber ?? "");
    onBankChange(action.bankCode);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex w-full flex-col gap-1">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={TITLE_TRANSITION}>
          <Title
            type="a2z"
            title={"친구들이 보탤 때\n받을 계좌를 넣어주세요"}
            description={"친구들이 보탤 때 이 계좌로 송금해요.\n보탬은 돈을 보관하지 않아요."}
            showButton
            buttonLabel="복사한 계좌 붙여넣기"
            onButtonClick={handlePasteFromClipboard}
          />
        </motion.div>
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={FIELD_TRANSITION}>
          <TextField
            label="계좌번호"
            placeholder="입력해주세요"
            inputMode="numeric"
            value={accountNumber}
            onChange={event => onAccountNumberChange(event.target.value.replace(/\D/g, ""))}
            onPaste={handleAccountNumberPaste}
          />
          <SelectBox label="은행" value={bankName} onClick={() => setBankSheetOpen(true)} />
          <ToastMessage show={toastText !== null} text={toastText ?? ""} state={false} />
        </motion.div>
      </div>
      <BankSelectBottomSheet
        open={bankSheetOpen}
        selectedBank={bank}
        onSelectBank={code => {
          onBankChange(code);
          setBankSheetOpen(false);
        }}
        onClose={() => setBankSheetOpen(false)}
      />
    </MotionConfig>
  );
}
