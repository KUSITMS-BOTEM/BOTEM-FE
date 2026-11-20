"use client";

import { useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import OpenSheet from "@/components/OpenSheet";
import TextField from "@/components/TextField";
import Title from "@/components/Title";
import { NUMBER_FIELD_LENGTH } from "@/components/NumberFieldGroup";
import { cn } from "@/utils/cn";

// 시트가 이미 떠 있는 상태에서 빈 화면 → Title → 입력 영역 순서로 나타난다 (FundingPasswordSheet 모션 기준)
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.15, duration: 0.45, ease: EASE_STANDARD };
const FIELD_TRANSITION = { delay: 0.4, duration: 0.4, ease: EASE_STANDARD };

type BotemEditSheetProps = {
  open: boolean;
  onClose: () => void;
  // 이름·비밀번호를 모두 채운 뒤 확인을 누르면 입력값과 함께 호출된다
  onSubmit: (name: string, password: string) => void;
  // 일치하는 보탬이 없을 때처럼 시트를 닫지 않고 재입력을 안내할 문구
  errorMessage?: string;
  // 확인 요청 중에는 중복 제출을 막는다
  isPending?: boolean;
  className?: string;
};

export default function BotemEditSheet({
  open,
  onClose,
  onSubmit,
  errorMessage,
  isPending = false,
  className,
}: BotemEditSheetProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  // iOS는 키보드 열림·닫힘 이벤트가 없어 input의 focus·blur를 키보드가 올라온 시점으로 본다
  const [isTyping, setIsTyping] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && password.length === NUMBER_FIELD_LENGTH;

  // 닫히는 경로(X·ESC·확인 후 부모가 닫음)와 상관없이 다음에 열 때 빈 입력으로 시작한다
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setName("");
      setPassword("");
      setIsTyping(false);
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit && !isPending) onSubmit(trimmedName, password);
  };

  return (
    <OpenSheet open={open} title="내 보탬 찾기" onClose={onClose} className={className}>
      {/* form은 Enter 제출만 담당하므로 contents로 레이아웃에 영향을 주지 않는다 */}
      <form onSubmit={handleSubmit} className="contents">
        <div className="flex w-full flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={TITLE_TRANSITION}
            className="w-full">
            <Title type="a2z" title={"보탤 때 입력한\n이름과 비밀번호 4자리를\n입력해주세요"} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={FIELD_TRANSITION}
            // 입력 영역이 다 나타난 뒤에 포커스해야 모션 중 키보드가 올라와 레이아웃이 흔들리지 않는다
            onAnimationComplete={() => nameRef.current?.focus({ preventScroll: true })}
            onFocus={() => setIsTyping(true)}
            // 이름→비밀번호처럼 입력란 사이를 옮길 때는 키보드가 내려가지 않으므로 영역 밖으로 나갈 때만 해제한다
            onBlur={event => {
              if (!event.currentTarget.contains(event.relatedTarget)) setIsTyping(false);
            }}
            className="flex w-full flex-col gap-3">
            <TextField
              ref={nameRef}
              label="이름"
              placeholder="보탤 때 입력한 이름 입력"
              autoComplete="off"
              enterKeyHint="next"
              value={name}
              onChange={event => setName(event.target.value)}
              onClear={() => setName("")}
            />
            <TextField
              label="비밀번호 4자리"
              placeholder="보탤 때 입력한 비밀번호 4자리"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              enterKeyHint="done"
              maxLength={NUMBER_FIELD_LENGTH}
              error={errorMessage !== undefined}
              helperText={errorMessage}
              value={password}
              onChange={event => setPassword(event.target.value.replace(/\D/g, ""))}
              onClear={() => setPassword("")}
            />
          </motion.div>
        </div>
        {/* 키보드가 올라온 터치 기기에서는 CTA가 키보드 위에 떠 입력을 가리므로 숨긴다 */}
        <BottomCTA className={cn(isTyping && "pointer-coarse:hidden")}>
          <Button color="brand" size="xlarge" type="submit" disabled={!canSubmit || isPending}>
            확인
          </Button>
        </BottomCTA>
      </form>
    </OpenSheet>
  );
}
