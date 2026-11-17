"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig, type Transition } from "framer-motion";
import { cn } from "@/utils/cn";
import Button from "@/components/Button";
import SheetHeader from "@/components/SheetHeader";
import { APP_MAX_WIDTH_CLASS } from "@/constants/layout";

type BottomSheetButtons = {
  leftLabel?: string;
  leftColor?: "neutral" | "brand";
  rightLabel: string;
  rightColor?: "brand" | "neutral";
  onLeftClick?: () => void;
  onRightClick?: () => void;
  leftDisabled?: boolean;
  rightDisabled?: boolean;
  upper?: ReactNode;
};

export type BottomSheetEnterTransition = { dim: Transition; sheet: Transition };

type BottomSheetProps = {
  open: boolean;
  title: string;
  height: "auto" | "max";
  headerType?: "title" | "handle";
  showHandleClose?: boolean;
  buttons?: BottomSheetButtons;
  toast?: ReactNode;
  enterTransition?: BottomSheetEnterTransition;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const EASE_EXIT = [0.3, 0, 1, 1] as const;
const DEFAULT_ENTER_TRANSITION: BottomSheetEnterTransition = {
  dim: { duration: 0.45, ease: EASE_STANDARD },
  sheet: { delay: 0.05, type: "spring", bounce: 0.25, duration: 0.55 },
};

const SHEET_HEIGHT_MAX = "h-[calc(100dvh_-_env(safe-area-inset-top)_+_24px)]";
const SHEET_HEIGHT_AUTO =
  "rounded-t-xxx-large max-h-[calc(100dvh_-_env(safe-area-inset-top)_-_32px)]";

export default function BottomSheet({
  open,
  title,
  height,
  headerType = "title",
  buttons,
  toast,
  enterTransition = DEFAULT_ENTER_TRANSITION,
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
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      dialog.showModal();
      window.scrollTo(scrollX, scrollY);
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
      aria-labelledby={headerType === "title" ? titleId : undefined}
      aria-label={headerType === "handle" ? title : undefined}
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
                animate={{ opacity: 1, transition: enterTransition.dim }}
                exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE_EXIT } }}
                onClick={onClose}
              />
              <motion.div
                key="sheet"
                className={cn(
                  "bg-semantic-fill-default fixed inset-x-0 -bottom-6 mx-auto flex w-full flex-col overflow-clip",
                  APP_MAX_WIDTH_CLASS,
                  height === "max" ? SHEET_HEIGHT_MAX : SHEET_HEIGHT_AUTO,
                  className,
                )}
                initial={{ y: "100%" }}
                animate={{ y: 0, transition: enterTransition.sheet }}
                exit={{ y: "100%", transition: { duration: 0.3, ease: EASE_EXIT } }}>
                <SheetHeader
                  title={title}
                  titleId={titleId}
                  onClose={onClose}
                  showHandle={height === "auto"}
                  type={headerType}
                />
                <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-5 pt-1 pb-4">
                  {children}
                </div>
                <div className="relative flex w-full shrink-0 flex-col items-start">
                  {toast && (
                    <div className="absolute inset-x-0 bottom-full flex justify-center px-5 pb-3">
                      {toast}
                    </div>
                  )}
                  {buttons && (
                    <>
                      <div className="from-semantic-background-default/0 to-semantic-background-default h-9 w-full bg-gradient-to-b" />
                      <div className="bg-semantic-background-default flex w-full flex-col pb-5">
                        {buttons.upper && (
                          <div className="flex w-full justify-center px-6 pb-6">
                            {buttons.upper}
                          </div>
                        )}
                        <div className="flex w-full items-start justify-center gap-2 px-5">
                          {buttons.leftLabel && (
                            <Button
                              color={buttons.leftColor ?? "neutral"}
                              variant="weak"
                              size="xlarge"
                              className="flex-1"
                              disabled={buttons.leftDisabled}
                              onClick={buttons.onLeftClick}>
                              {buttons.leftLabel}
                            </Button>
                          )}
                          <Button
                            color={buttons.rightColor ?? "brand"}
                            variant={buttons.rightColor === "neutral" ? "weak" : "fill"}
                            size="xlarge"
                            className="flex-1"
                            disabled={buttons.rightDisabled}
                            onClick={buttons.onRightClick}>
                            {buttons.rightLabel}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div aria-hidden className="bg-semantic-fill-default h-6 w-full shrink-0" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </MotionConfig>
    </dialog>
  );
}
