"use client";

import { type ClipboardEvent, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { motion, MotionConfig } from "framer-motion";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import SelectBox from "@/components/SelectBox";
import TextField from "@/components/TextField";
import Title from "@/components/Title";
import ToastMessage from "@/components/ToastMessage";
import { BANKS, type BankCode } from "@/constants/bank";
import { useCompleteOnboardingMutation } from "@/hooks/mutations/user/useCompleteOnboardingMutation";
import { getSignupFlow } from "@/utils/auth/signupFlowStorage";
import {
  ACCOUNT_NUMBER_REGEX,
  parseClipboardAccount,
} from "@/utils/payout-account/parseClipboardAccount";
import BankSelectBottomSheet from "@/widgets/payout-account/BankSelectBottomSheet";
import IconLeft from "@/assets/icons/icon-left.svg?react";

import {
  readClipboardText,
  resolveClipboardPasteAction,
} from "@/utils/payout-account/clipboardPaste";

// Figma "01 모션 토큰" 기준: ease.standard / duration.enter·move / delay.start·stagger / distance.title·field
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.3, duration: 0.45, ease: EASE_STANDARD };
const FIELD_TRANSITION = { delay: 0.8, duration: 0.4, ease: EASE_STANDARD };
const TOAST_DURATION_MS = 2500;

export default function PayoutAccountContainer() {
  const router = useRouter();
  const { mutate: completeOnboarding, isPending } = useCompleteOnboardingMutation();
  const [accountNumber, setAccountNumber] = useState("");
  const [bankSheetOpen, setBankSheetOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankCode | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);
  const bankName = BANKS.find(bank => bank.code === selectedBank)?.name ?? "";

  useEffect(() => {
    if (getSignupFlow()?.step !== "accountEntry") router.replace("/auth/profile-check");
  }, [router]);

  useEffect(() => {
    if (!toastText) return;
    const timer = setTimeout(() => setToastText(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastText]);

  const handleStart = () => {
    const flow = getSignupFlow();
    if (!flow?.nickname) {
      alert("에러가 발생했습니다");
      router.replace("/");
      return;
    }
    if (!selectedBank) return;

    completeOnboarding({
      name: flow.nickname,
      birthday: flow.birthday,
      bank: selectedBank,
      accountNumber,
    });
  };

  const handlePasteFromClipboard = async () => {
    const text = await readClipboardText();
    const action = resolveClipboardPasteAction(parseClipboardAccount(text));
    if (action.accountNumber) setAccountNumber(action.accountNumber);
    if (action.bankCode) setSelectedBank(action.bankCode);
    if (action.toastText) setToastText(action.toastText);
  };

  // "은행명 계좌번호" 형식일 때만 가로채 은행까지 채운다. 그 외엔 기본 붙여넣기에 맡겨 숫자만 필터링되게 한다
  const handleAccountNumberPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const action = resolveClipboardPasteAction(
      parseClipboardAccount(event.clipboardData.getData("text")),
    );
    if (!action.bankCode) return;
    event.preventDefault();
    setAccountNumber(action.accountNumber ?? "");
    setSelectedBank(action.bankCode);
  };

  return (
    <MotionConfig reducedMotion="user">
      <Header
        title="회원가입"
        leftItem={{
          icon: <IconLeft />,
          ariaLabel: "뒤로 가기",
          onClick: () => router.push("/auth/profile-check"),
        }}
      />
      <main className="flex flex-col gap-1 px-5">
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
            onChange={event => setAccountNumber(event.target.value.replace(/\D/g, ""))}
            onPaste={handleAccountNumberPaste}
          />
          <SelectBox label="은행" value={bankName} onClick={() => setBankSheetOpen(true)} />
          <ToastMessage show={toastText !== null} text={toastText ?? ""} state={false} />
        </motion.div>
      </main>
      <BankSelectBottomSheet
        open={bankSheetOpen}
        selectedBank={selectedBank}
        onSelectBank={code => {
          setSelectedBank(code);
          setBankSheetOpen(false);
        }}
        onClose={() => setBankSheetOpen(false)}
      />
      <BottomCTA>
        <Button
          color="neutral"
          variant="weak"
          size="xlarge"
          onClick={() => router.push("/auth/profile-check")}>
          이전
        </Button>
        <Button
          color="brand"
          size="xlarge"
          disabled={!ACCOUNT_NUMBER_REGEX.test(accountNumber) || !selectedBank}
          states={isPending ? "loading" : "default"}
          onClick={handleStart}>
          시작하기
        </Button>
      </BottomCTA>
    </MotionConfig>
  );
}
