"use client";

import { useState } from "react";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import TextButton from "@/components/TextButton";
import type { BankCode } from "@/constants/bank";
import { usePayoutAccountsQuery } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import { ACCOUNT_NUMBER_REGEX } from "@/utils/payout-account/parseClipboardAccount";
import PayoutAccountForm from "@/widgets/payout-account/PayoutAccountForm";
import IconReset from "@/assets/icons/icon-reset.svg?react";

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
  const { data: payoutAccounts } = usePayoutAccountsQuery();
  const defaultAccount = payoutAccounts?.find(account => account.isDefault);

  const fillDefaultAccount = () => {
    if (!defaultAccount) return;
    setAccountNumber(defaultAccount.accountNumber);
    setBank(defaultAccount.bank);
  };

  return (
    <>
      <PayoutAccountForm
        accountNumber={accountNumber}
        bank={bank}
        onAccountNumberChange={setAccountNumber}
        onBankChange={setBank}
        animated={!seed}
      />
      <BottomCTA
        upper={
          <TextButton
            color="neutral"
            size="medium"
            label="대표 계좌 사용하기"
            icon={<IconReset />}
            disabled={!defaultAccount}
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
