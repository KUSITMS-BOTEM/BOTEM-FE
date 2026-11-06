"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { motion, MotionConfig } from "framer-motion";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import SelectBox from "@/components/SelectBox";
import TextField from "@/components/TextField";
import Title from "@/components/Title";
import { clearSignupFlow, getSignupFlow } from "@/utils/signupFlowStorage";
import IconLeft from "@/assets/icons/icon-left.svg?react";

// Figma "01 모션 토큰" 기준: ease.standard / duration.enter·move / delay.start·stagger / distance.title·field
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.3, duration: 0.45, ease: EASE_STANDARD };
const FIELD_TRANSITION = { delay: 0.8, duration: 0.4, ease: EASE_STANDARD };

export default function AccountEntry() {
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState("");
  // 은행 선택 바텀시트는 다음 세션에서 연동 — 그 전까지는 항상 미선택 상태
  const bank = "";

  useEffect(() => {
    if (getSignupFlow()?.step !== "accountEntry") router.replace("/auth/profile-check");
  }, [router]);

  const handleStart = () => {
    clearSignupFlow();
    router.replace("/main");
  };

  return (
    <MotionConfig reducedMotion="user">
      <Header
        title="회원가입"
        leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.push("/") }}
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
            // 클립보드 붙여넣기 로직은 다음 세션에서 추가 예정
            onButtonClick={() => {}}
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
            value={accountNumber}
            onChange={event => setAccountNumber(event.target.value)}
          />
          <SelectBox label="은행" value={bank} />
        </motion.div>
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
          disabled={!accountNumber || !bank}
          onClick={handleStart}>
          시작하기
        </Button>
      </BottomCTA>
    </MotionConfig>
  );
}
