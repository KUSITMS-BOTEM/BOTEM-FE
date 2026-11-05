"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import { clearSignupFlow, getSignupFlow } from "@/utils/signupFlowStorage";

const BANKS = ["토스뱅크", "카카오뱅크"];

export default function AccountEntry() {
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState("");

  useEffect(() => {
    if (getSignupFlow()?.step !== "accountEntry") router.replace("/auth/profile-check");
  }, [router]);

  const handleStart = () => {
    clearSignupFlow();
    router.replace("/main");
  };

  return (
    <div>
      계좌 입력 페이지(신규 유저)
      <input
        placeholder="계좌번호"
        value={accountNumber}
        onChange={event => setAccountNumber(event.target.value)}
      />
      <select value={bank} onChange={event => setBank(event.target.value)}>
        <option value="">은행 선택</option>
        {BANKS.map(name => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <Button onClick={handleStart} disabled={!accountNumber || !bank}>
        시작하기
      </Button>
    </div>
  );
}
