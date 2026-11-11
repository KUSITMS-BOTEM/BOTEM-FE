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

type FundingAccountStepProps = {
  onPrev: () => void;
};

export default function FundingAccountStep({ onPrev }: FundingAccountStepProps) {
  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState<BankCode | null>(null);
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
        <Button color="neutral" variant="weak" size="xlarge" onClick={onPrev}>
          이전
        </Button>
        <Button
          color="brand"
          size="xlarge"
          disabled={!ACCOUNT_NUMBER_REGEX.test(accountNumber) || !bank}>
          펀딩 열기
        </Button>
      </BottomCTA>
    </>
  );
}
