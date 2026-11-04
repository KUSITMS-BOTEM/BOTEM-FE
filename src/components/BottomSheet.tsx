"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { cn } from "@/utils/cn";
import Button from "@/components/Button";
import BottomSheetHeader from "@/components/BottomSheetHeader";

type BottomSheetProps = {
  open: boolean;
  title: string;
  height: "auto" | "max";
  leftButtonLabel: string;
  rightButtonLabel: string;
  onLeftButtonClick: () => void;
  onRightButtonClick: () => void;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

// 모바일 화면 폭 기준 — 넓은 화면에서도 카드 형태로 가운데 고정
const SHEET_MAX_WIDTH = "max-w-sm";
// Figma Motion·바텀시트(P7) 디자인팀 노트: 진입 = 딤 450ms ease.standard, 50ms 지연 뒤 시트 spring bounce 0.25·550ms / 퇴장 = 딤·시트 동시 300ms ease.exit
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const EASE_EXIT = [0.3, 0, 1, 1] as const;
// 상단 56px 여백은 유지한 채, 시트 박스 자체를 24px 더 길게 만들고 그만큼 화면 아래로 내려 바운스 시 바닥에 틈이 보이지 않게 한다.
// Tailwind가 클래스명을 정적으로 스캔하므로 두 값을 완전한 리터럴 문자열로 각각 써야 한다(템플릿 리터럴 조립 금지).
const SHEET_HEIGHT_MAX = "h-[calc(100dvh_-_env(safe-area-inset-top)_-_32px)]";
const SHEET_HEIGHT_AUTO = "max-h-[calc(100dvh_-_env(safe-area-inset-top)_-_32px)]";

export default function BottomSheet({
  open,
  title,
  height,
  leftButtonLabel,
  rightButtonLabel,
  onLeftButtonClick,
  onRightButtonClick,
  onClose,
  children,
  className,
}: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      // showModal()은 내부적으로 다이얼로그에 포커스를 주며 스크롤을 동기적으로 발생시켜,
      // 그 뒤의 focus({ preventScroll: true })로는 이미 일어난 스크롤을 되돌릴 수 없다.
      // 호출 전 스크롤 위치를 저장해두고 그대로 복원한다(시트는 fixed라 스크롤 위치와 무관하게 항상 화면에 붙어 있다).
      const scrollY = window.scrollY;
      dialog.showModal();
      window.scrollTo(0, scrollY);
      dialog.focus({ preventScroll: true });
    }
    setVisible(open);
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    // 브라우저가 ESC 남용 방지 규칙 등으로 cancel을 막지 못하고 dialog를 강제로 닫는 경우,
    // open prop과 실제 DOM 상태가 어긋나지 않도록 동기화한다.
    const handleClose = () => {
      if (open) onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
    };
  }, [open, onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-0 border-none bg-transparent p-0 outline-none backdrop:bg-transparent">
      <MotionConfig reducedMotion="user">
        <AnimatePresence onExitComplete={() => dialogRef.current?.close()}>
          {visible && (
            <>
              <motion.div
                key="dim"
                aria-hidden
                className="bg-semantic-background-dim fixed inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.45, ease: EASE_STANDARD } }}
                exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE_EXIT } }}
                onClick={onClose}
              />
              <motion.div
                key="sheet"
                className={cn(
                  "rounded-t-xxx-large bg-semantic-fill-default fixed inset-x-0 -bottom-6 mx-auto flex w-full flex-col overflow-clip",
                  SHEET_MAX_WIDTH,
                  height === "max" ? SHEET_HEIGHT_MAX : SHEET_HEIGHT_AUTO,
                  className,
                )}
                initial={{ y: "100%" }}
                animate={{
                  y: 0,
                  transition: { delay: 0.05, type: "spring", bounce: 0.25, duration: 0.55 },
                }}
                exit={{ y: "100%", transition: { duration: 0.3, ease: EASE_EXIT } }}>
                <BottomSheetHeader title={title} titleId={titleId} onClose={onClose} />
                <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-5 pt-1 pb-4">
                  {children}
                </div>
                <div className="flex w-full shrink-0 flex-col items-start">
                  <div className="from-semantic-background-default/0 to-semantic-background-default h-9 w-full bg-gradient-to-b" />
                  <div className="bg-semantic-background-default flex w-full items-start justify-center gap-2 px-5 pb-5">
                    <Button
                      color="neutral"
                      variant="weak"
                      size="xlarge"
                      className="flex-1"
                      onClick={onLeftButtonClick}>
                      {leftButtonLabel}
                    </Button>
                    <Button
                      color="brand"
                      variant="fill"
                      size="xlarge"
                      className="flex-1"
                      onClick={onRightButtonClick}>
                      {rightButtonLabel}
                    </Button>
                  </div>
                </div>
                {/* height=auto는 콘텐츠만큼 박스가 줄어들어 -bottom-6 오프셋이 그대로 하단을 가리므로, 늘어난 24px를 상쇄할 여백을 직접 채워준다 (height=max는 SHEET_HEIGHT_MAX 계산식 자체에 이미 포함됨) */}
                {height === "auto" && (
                  <div aria-hidden className="bg-semantic-fill-default h-6 w-full shrink-0" />
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </MotionConfig>
    </dialog>
  );
}
