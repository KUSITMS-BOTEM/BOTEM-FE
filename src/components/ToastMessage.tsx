"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import Asset from "@/components/Asset";
import Button from "@/components/Button";
import IconCheckCircleFill from "@/assets/icons/icon-checkcirclefill.svg?react";
import IconErrorCircleFill from "@/assets/icons/icon-errorcirclefill.svg?react";

type ToastMessageBaseProps = {
  show: boolean;
  text: string;
  state?: boolean;
  withIcon?: ReactNode;
  className?: string;
};

type ToastMessageProps = ToastMessageBaseProps &
  (
    | { showButton: true; buttonText: string; onButtonClick: () => void }
    | { showButton?: false; buttonText?: never; onButtonClick?: never }
  );

export default function ToastMessage({
  show,
  text,
  state,
  withIcon,
  showButton = false,
  buttonText,
  onButtonClick,
  className,
}: ToastMessageProps) {
  const icon =
    state === true ? (
      <IconCheckCircleFill aria-hidden />
    ) : state === false ? (
      <IconErrorCircleFill aria-hidden />
    ) : (
      withIcon
    );
  const iconColor =
    state === true
      ? "text-semantic-icon-success"
      : state === false
        ? "text-semantic-icon-danger"
        : "text-semantic-icon-default";

  return (
    <div role="status">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "bg-semantic-fill-default/70 flex w-fit max-w-80 items-center gap-4 rounded-2xl px-5 py-4 shadow-[0px_4px_16px_0px_var(--color-semantic-shadow-default)]",
              className,
            )}>
            <div className={cn("flex min-w-0 flex-1 items-start", icon && "gap-2")}>
              {icon && (
                <span className="flex h-4 shrink-0 items-center">
                  <Asset icon={icon} size="small" className={iconColor} />
                </span>
              )}
              <p className="text-semantic-text-primary min-w-0 flex-1 [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small)]">
                {text}
              </p>
            </div>
            {showButton && (
              <Button color="neutral" variant="weak" size="small" onClick={onButtonClick}>
                {buttonText}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
