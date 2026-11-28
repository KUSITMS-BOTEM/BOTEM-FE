"use client";

import { useState } from "react";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import TextButton from "@/components/TextButton";
import type { BankCode } from "@/constants/bank";
import { usePayoutAccountsQuery } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import { cn } from "@/utils/cn";
import { ACCOUNT_NUMBER_REGEX } from "@/utils/payout-account/parseClipboardAccount";
import PayoutAccountForm from "@/widgets/payout-account/PayoutAccountForm";

export type FundingAccountValues = {
  accountNumber: string;
  bank: BankCode;
};

type FundingAccountStepProps = {
  onSubmit: (values: FundingAccountValues) => void;
  // 있으면 수정 모드: 값을 채워 보여주고 이전 버튼 없이 값이 바뀌어야 CTA가 활성화된다
  initialValues?: FundingAccountValues;
  // 수정 모드 없이 값만 미리 채운다. 수정 시트에서 바꾼 값을 숨겨 둔 입력 단계에 반영할 때 쓴다
  defaultValues?: FundingAccountValues;
  onPrev?: () => void;
  submitLabel?: string;
};

export default function FundingAccountStep({
  onSubmit,
  initialValues,
  defaultValues,
  onPrev,
  submitLabel = "펀딩 열기",
}: FundingAccountStepProps) {
  const seed = initialValues ?? defaultValues;
  const [accountNumber, setAccountNumber] = useState(seed?.accountNumber ?? "");
  const [bank, setBank] = useState<BankCode | null>(seed?.bank ?? null);
  // 웹은 키보드 열림·닫힘 이벤트가 없어 계좌번호 입력란의 focus·blur를 키보드가 올라온 시점으로 본다
  const [isTyping, setIsTyping] = useState(false);
  const { data: payoutAccounts } = usePayoutAccountsQuery();
  const defaultAccount = payoutAccounts?.find(account => account.isDefault);

  const isDefaultAccountFilled =
    accountNumber === defaultAccount?.accountNumber && bank === defaultAccount?.bank;

  const fillDefaultAccount = () => {
    if (!defaultAccount) return;
    setAccountNumber(defaultAccount.accountNumber);
    setBank(defaultAccount.bank);
  };

  // 대표 계좌는 한 번만 채운다. 사용자가 먼저 입력을 바꿨다면(지운 경우 포함) 채우지 않는다
  const [prefilled, setPrefilled] = useState(Boolean(seed));
  if (defaultAccount && !prefilled) {
    setPrefilled(true);
    fillDefaultAccount();
  }

  return (
    <>
      <div
        className="contents"
        onFocus={event => setIsTyping(event.target instanceof HTMLInputElement)}
        onBlur={() => setIsTyping(false)}>
        <PayoutAccountForm
          accountNumber={accountNumber}
          bank={bank}
          onAccountNumberChange={value => {
            setPrefilled(true);
            setAccountNumber(value);
          }}
          onBankChange={code => {
            setPrefilled(true);
            setBank(code);
          }}
          animated={!seed}
        />
      </div>
      {/* 키보드가 올라온 터치 기기에서는 CTA가 키보드 위에 떠 입력을 가리므로 숨긴다 */}
      <BottomCTA
        className={cn(isTyping && "pointer-coarse:hidden")}
        upper={
          <TextButton
            color="neutral"
            size="medium"
            label="대표 계좌 사용하기"
            rightIcon={false}
            disabled={!defaultAccount || isDefaultAccountFilled}
            onClick={fillDefaultAccount}
          />
        }>
        {onPrev && (
          <Button color="neutral" variant="weak" size="xlarge" onClick={onPrev}>
            이전
          </Button>
        )}
        <Button
          color="brand"
          size="xlarge"
          disabled={
            !ACCOUNT_NUMBER_REGEX.test(accountNumber) ||
            !bank ||
            (accountNumber === initialValues?.accountNumber && bank === initialValues?.bank)
          }
          onClick={() => bank && onSubmit({ accountNumber, bank })}>
          {submitLabel}
        </Button>
      </BottomCTA>
    </>
  );
}
