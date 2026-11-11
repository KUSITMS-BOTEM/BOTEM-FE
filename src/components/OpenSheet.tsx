"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { cn } from "@/utils/cn";
import SheetHeader from "@/components/SheetHeader";
import { APP_MAX_WIDTH_CLASS } from "@/constants/layout";

type OpenSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

// Figma 프로토타입(홈 추가 메뉴 → 목표 금액 진입) 전환: 오른쪽에서 왼쪽으로 Ease out 300ms. spring이 아니라 오버슈트가 없어 가장자리 보정이 필요 없다. 닫을 때는 모션 없이 즉시 사라진다(디자인 요청).
const SLIDE_TRANSITION = { duration: 0.3, ease: "easeOut" } as const;
const NO_TRANSITION = { duration: 0 } as const;

export default function OpenSheet({ open, title, onClose, children, className }: OpenSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      // showModal()이 동기적으로 일으키는 스크롤을 호출 전 위치로 되돌린다(시트는 fixed라 스크롤과 무관).
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
    // 브라우저가 cancel을 막지 못하고 dialog를 강제로 닫는 경우 open prop과 DOM 상태를 동기화한다.
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
                animate={{ opacity: 1, transition: SLIDE_TRANSITION }}
                exit={{ opacity: 0, transition: NO_TRANSITION }}
                onClick={onClose}
              />
              {/* 앱 폭 컬럼 안에서만 슬라이드하도록 overflow를 잘라, 넓은 화면에서 시트가 컬럼 밖에 보이지 않게 한다 */}
              <motion.div
                key="clip"
                className={cn(
                  "fixed inset-x-0 top-[env(safe-area-inset-top)] bottom-0 mx-auto w-full overflow-clip",
                  APP_MAX_WIDTH_CLASS,
                )}>
                <motion.div
                  className={cn(
                    "bg-semantic-fill-default flex h-full w-full flex-col overflow-clip",
                    className,
                  )}
                  initial={{ x: "100%" }}
                  animate={{ x: 0, transition: SLIDE_TRANSITION }}
                  exit={{ x: "100%", transition: NO_TRANSITION }}>
                  <SheetHeader
                    title={title}
                    titleId={titleId}
                    onClose={onClose}
                    showHandle={false}
                  />
                  <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-5 pt-1 pb-4">
                    {children}
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </MotionConfig>
    </dialog>
  );
}
