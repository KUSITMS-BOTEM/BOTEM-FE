"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import NumberFieldGroup, { NUMBER_FIELD_LENGTH } from "@/components/NumberFieldGroup";
import OpenSheet from "@/components/OpenSheet";
import Title from "@/components/Title";
import { cn } from "@/utils/cn";
import FundingTransferGuideSheet, {
  type FundingTransferAccount,
} from "@/widgets/funding/FundingTransferGuideSheet";

// 시트가 이미 떠 있는 상태에서 빈 화면 → Title → 입력 영역 순서로 나타난다 (FundingContributeSheet 모션 기준)
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.15, duration: 0.45, ease: EASE_STANDARD };
const FIELD_TRANSITION = { delay: 0.4, duration: 0.4, ease: EASE_STANDARD };
const KEYPAD_HIDE_DELAY_MS = 400;

type FundingPasswordSheetProps = {
  open: boolean;
  hostName: string;
  // 송금 안내 시트에 그대로 넘긴다
  amount: number;
  account: FundingTransferAccount;
  onClose: () => void;
  onPrev: () => void;
  // 보태러 가기 뒤 송금 안내 시트에서 완료하기를 누르면 입력한 비밀번호와 함께 호출된다
  onComplete: (password: string) => void;
  className?: string;
};

export default function FundingPasswordSheet({
  open,
  hostName,
  amount,
  account,
  onClose,
  onPrev,
  onComplete,
  className,
}: FundingPasswordSheetProps) {
  const [password, setPassword] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  // iOS는 키보드 열림·닫힘 이벤트가 없어 input의 focus·blur를 키보드가 올라온 시점으로 본다
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFilled = password.length === NUMBER_FIELD_LENGTH;

  // 닫히는 경로(X·ESC·완료 후 부모가 닫음)와 상관없이 다음에 열 때 빈 입력으로 시작한다
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setPassword("");
      setIsTyping(false);
      setGuideOpen(false);
    }
  }

  // 마지막 자리가 채워진 모습을 잠깐 보여준 뒤 키패드를 내린다
  useEffect(() => {
    if (!isFilled) return;
    const timer = setTimeout(() => inputRef.current?.blur(), KEYPAD_HIDE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isFilled]);

  return (
    <>
      <OpenSheet
        open={open}
        title={`${hostName}에게 보태기`}
        onClose={onClose}
        className={className}>
        <div className="flex w-full flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={TITLE_TRANSITION}
            className="w-full">
            <Title
              type="a2z"
              title={"내 보탬을 지킬\n비밀번호 4자리를 정해주세요"}
              description="나중에 메시지를 고칠 때 이름과 함께 써요"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={FIELD_TRANSITION}
            // 입력 영역이 다 나타난 뒤에 포커스해야 모션 중 키보드가 올라와 레이아웃이 흔들리지 않는다
            onAnimationComplete={() => inputRef.current?.focus({ preventScroll: true })}
            className="w-full">
            <NumberFieldGroup
              ref={inputRef}
              label="비밀번호 4자리"
              value={password}
              onChange={setPassword}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
            />
          </motion.div>
        </div>
        {/* 키보드가 올라온 터치 기기에서는 CTA가 키보드 위에 떠 입력을 가리므로 숨긴다 */}
        <BottomCTA className={cn(isTyping && "pointer-coarse:hidden")}>
          <Button color="neutral" variant="weak" size="xlarge" onClick={onPrev}>
            이전
          </Button>
          <Button
            color="brand"
            size="xlarge"
            disabled={!isFilled}
            onClick={() => setGuideOpen(true)}>
            보태러 가기
          </Button>
        </BottomCTA>
      </OpenSheet>
      <FundingTransferGuideSheet
        open={guideOpen}
        hostName={hostName}
        amount={amount}
        account={account}
        onClose={() => setGuideOpen(false)}
        onComplete={() => onComplete(password)}
      />
    </>
  );
}
