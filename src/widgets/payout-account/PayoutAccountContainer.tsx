"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import type { BankCode } from "@/constants/bank";
import { useCompleteOnboardingMutation } from "@/hooks/mutations/user/useCompleteOnboardingMutation";
import { getSignupFlow } from "@/utils/auth/signupFlowStorage";
import { ACCOUNT_NUMBER_REGEX } from "@/utils/payout-account/parseClipboardAccount";
import PayoutAccountForm from "@/widgets/payout-account/PayoutAccountForm";
import IconLeft from "@/assets/icons/icon-left.svg?react";

export default function PayoutAccountContainer() {
  const router = useRouter();
  const { mutate: completeOnboarding, isPending } = useCompleteOnboardingMutation();
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState<BankCode | null>(null);

  useEffect(() => {
    if (getSignupFlow()?.step !== "accountEntry") router.replace("/auth/profile-check");
  }, [router]);

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

  return (
    <>
      <Header
        title="회원가입"
        leftItem={{
          icon: <IconLeft />,
          ariaLabel: "뒤로 가기",
          onClick: () => router.push("/auth/profile-check"),
        }}
      />
      <main className="px-5">
        <PayoutAccountForm
          accountNumber={accountNumber}
          bank={selectedBank}
          onAccountNumberChange={setAccountNumber}
          onBankChange={setSelectedBank}
        />
      </main>
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
    </>
  );
}
