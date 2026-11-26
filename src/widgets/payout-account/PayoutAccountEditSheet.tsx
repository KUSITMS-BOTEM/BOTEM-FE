"use client";

import { useState } from "react";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import CloseSheet from "@/components/CloseSheet";
import TextButton from "@/components/TextButton";
import type { BankCode } from "@/constants/bank";
import { useUpdatePayoutAccountMutation } from "@/hooks/mutations/payout-account/useUpdatePayoutAccountMutation";
import { usePayoutAccountsQuery } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import type { PayoutAccountResponse } from "@/types/payout-account/payoutAccount";
import { ACCOUNT_NUMBER_REGEX } from "@/utils/payout-account/parseClipboardAccount";
import PayoutAccountForm from "@/widgets/payout-account/PayoutAccountForm";

type PayoutAccountEditSheetProps = {
  open: boolean;
  onClose: () => void;
};

export default function PayoutAccountEditSheet({ open, onClose }: PayoutAccountEditSheetProps) {
  // 내 메뉴 안에 항상 마운트돼 있어, 열릴 때만 조회해야 홈 진입 때 요청이 나가지 않는다
  const { data: payoutAccounts } = usePayoutAccountsQuery(open);
  const { mutate: updatePayoutAccount, isPending } = useUpdatePayoutAccountMutation();
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

  // 저장하지 않고 닫으면 다음에 열 때 수정 전 대표 계좌로 다시 보이도록 되돌려둔다. 요청 중에는 닫지 않는다
  const handleClose = () => {
    if (isPending) return;
    handleReset();
    onClose();
  };

  const handleSubmit = () => {
    if (!original || !bank) return;
    updatePayoutAccount(
      { accountId: original.id, bank, accountNumber, accountHolder: original.accountHolder },
      {
        onSuccess: updated => {
          // 응답이 비어 있어도 방금 저장한 값을 기준으로 삼고, 요청 중 바뀐 입력도 저장 결과에 맞춘다
          const saved = updated ?? { ...original, bank, accountNumber };
          setOriginal(saved);
          setBank(saved.bank);
          setAccountNumber(saved.accountNumber);
          onClose();
        },
      },
    );
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
            rightIcon={false}
            disabled={!isChanged}
            onClick={handleReset}
            className="text-semantic-text-secondary"
          />
        }>
        <Button
          color="brand"
          size="xlarge"
          states={isPending ? "loading" : "default"}
          disabled={!isChanged || !ACCOUNT_NUMBER_REGEX.test(accountNumber) || !bank}
          onClick={handleSubmit}>
          수정 완료
        </Button>
      </BottomCTA>
    </CloseSheet>
  );
}
