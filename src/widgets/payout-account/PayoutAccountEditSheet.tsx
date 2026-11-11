"use client";

import { useState } from "react";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import CloseSheet from "@/components/CloseSheet";
import TextButton from "@/components/TextButton";
import type { BankCode } from "@/constants/bank";
import { usePayoutAccountsQuery } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import type { PayoutAccountResponse } from "@/types/payout-account/payoutAccount";
import { ACCOUNT_NUMBER_REGEX } from "@/utils/payout-account/parseClipboardAccount";
import PayoutAccountForm from "@/widgets/payout-account/PayoutAccountForm";
import IconReset from "@/assets/icons/icon-reset.svg?react";

type PayoutAccountEditSheetProps = {
  open: boolean;
  onClose: () => void;
};

export default function PayoutAccountEditSheet({ open, onClose }: PayoutAccountEditSheetProps) {
  const { data: payoutAccounts } = usePayoutAccountsQuery();
  const [original, setOriginal] = useState<PayoutAccountResponse>();
  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState<BankCode | null>(null);
  const defaultAccount = payoutAccounts?.find(account => account.isDefault);

  if (defaultAccount && !original) {
    setOriginal(defaultAccount);
    setAccountNumber(defaultAccount.accountNumber);
    setBank(defaultAccount.bank);
  }

  const isChanged =
    accountNumber !== (original?.accountNumber ?? "") || bank !== (original?.bank ?? null);

  const handleReset = () => {
    setAccountNumber(original?.accountNumber ?? "");
    setBank(original?.bank ?? null);
  };

  // 저장하지 않고 닫으면 다음에 열 때 수정 전 대표 계좌로 다시 보이도록 되돌려둔다
  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <CloseSheet open={open} title="대표 계좌 수정" onClose={handleClose}>
      <PayoutAccountForm
        accountNumber={accountNumber}
        bank={bank}
        onAccountNumberChange={setAccountNumber}
        onBankChange={setBank}
        animated={false}
      />
      <BottomCTA
        upper={
          <TextButton
            size="medium"
            label="계좌 되돌리기"
            icon={<IconReset />}
            disabled={!isChanged}
            onClick={handleReset}
            className="text-semantic-text-secondary"
          />
        }>
        <Button
          color="brand"
          size="xlarge"
          disabled={!isChanged || !ACCOUNT_NUMBER_REGEX.test(accountNumber) || !bank}>
          수정 완료
        </Button>
      </BottomCTA>
    </CloseSheet>
  );
}
