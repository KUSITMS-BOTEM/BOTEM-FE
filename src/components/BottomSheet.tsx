"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
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

type BottomSheetProps = {
  open: boolean;
  title: string;
  height: "auto" | "max";
  headerType?: "title" | "handle";
  buttons?: BottomSheetButtons;
  toast?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

// Figma Motion·바텀시트(P7) 디자인팀 노트: 진입 = 딤 450ms ease.standard, 50ms 지연 뒤 시트 spring bounce 0.25·550ms / 퇴장 = 딤·시트 동시 300ms ease.exit
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const EASE_EXIT = [0.3, 0, 1, 1] as const;
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
                animate={{ opacity: 1, transition: { duration: 0.45, ease: EASE_STANDARD } }}
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
                animate={{
                  y: 0,
                  transition: { delay: 0.05, type: "spring", bounce: 0.25, duration: 0.55 },
                }}
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
                {/* -bottom-6 오프셋은 height와 무관하게 시트 하단을 뷰포트보다 24px 아래에 고정하므로, 버튼 영역이 가려지지 않도록 두 모드 모두에서 여백을 채워준다 */}
                <div aria-hidden className="bg-semantic-fill-default h-6 w-full shrink-0" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </MotionConfig>
    </dialog>
  );
}
