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
import { useLogoutMutation } from "@/hooks/mutations/auth/useLogoutMutation";
import { useAuthStore } from "@/store/authStore";
import { getSignupFlow, setSignupFlow } from "@/utils/signupFlowStorage";
import IconLeft from "@/assets/icons/icon-left.svg?react";

// Figma "01 모션 토큰" 기준: ease.standard / duration.enter·move / delay.start·stagger / distance.title·field
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.3, duration: 0.45, ease: EASE_STANDARD };
const FIELD_TRANSITION = { delay: 0.8, duration: 0.4, ease: EASE_STANDARD };

export default function ProfileCheck() {
  const router = useRouter();
  const { mutate: logout } = useLogoutMutation();
  const [nickname, setNickname] = useState("");
  const [birthday, setBirthday] = useState("");

  useEffect(() => {
    if (!getSignupFlow()) router.replace("/");
  }, [router]);

  const handleNext = () => {
    setSignupFlow({ step: "accountEntry", nickname, birthday });
    router.push("/auth/payout-account");
  };

  const handleBack = () => {
    logout(undefined, {
      onSuccess: () => {
        useAuthStore.getState().clearAccessToken();
        router.replace("/");
      },
    });
  };

  return (
    <MotionConfig reducedMotion="user">
      <Header
        title="회원가입"
        leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: handleBack }}
      />
      <main className="flex flex-col gap-1 px-5">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={TITLE_TRANSITION}>
          <Title
            type="a2z"
            title={"이름과 생일이 맞는지\n확인해주세요"}
            description="등록된 정보와 다르다면 수정해주세요."
          />
        </motion.div>
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={FIELD_TRANSITION}>
          <TextField
            label="이름"
            value={nickname}
            onChange={event => setNickname(event.target.value)}
          />
          <SelectBox
            variant="birth"
            label="생일"
            value={birthday}
            onDateChange={(month, day) => setBirthday(`${month}월 ${day}일`)}
          />
        </motion.div>
      </main>
      <BottomCTA>
        <Button color="brand" size="xlarge" disabled={!nickname || !birthday} onClick={handleNext}>
          다음으로
        </Button>
      </BottomCTA>
    </MotionConfig>
  );
}
