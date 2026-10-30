"use client";

import { useEffect, useId, useRef, type SyntheticEvent } from "react";
import { cn } from "@/utils/cn";
import Button from "@/components/Button";
import TextButton from "@/components/TextButton";

type DialogAlertProps = {
  kind: "alert";
  confirmLabel?: string;
  confirmColor?: "brand" | "danger";
  onConfirm: () => void;
};

type DialogConfirmProps = {
  kind: "confirm";
  confirmLabel?: string;
  cancelLabel?: string;
  direction?: "horizontal" | "vertical";
  onConfirm: () => void;
  onCancel: () => void;
};

type DialogProps = (DialogAlertProps | DialogConfirmProps) & {
  open: boolean;
  title: string;
  description?: string;
  className?: string;
};

export default function Dialog({ open, title, description, className, ...props }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // ESC로 브라우저가 직접 닫으면 open prop과 어긋나므로 막고, 취소(alert는 확인) 동작으로 넘긴다
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (props.kind === "confirm") props.onCancel();
    else props.onConfirm();
  };

  const isVertical = props.kind === "confirm" && props.direction === "vertical";
  const buttonClassName = isVertical ? "w-full" : "min-w-20 flex-1";
  const confirmButton = (
    <Button size="large" variant="fill" className={buttonClassName} onClick={props.onConfirm}>
      {props.confirmLabel ?? "예"}
    </Button>
  );

  return (
    <dialog
      ref={dialogRef}
      tabIndex={-1}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleCancel}
      className={cn(
        "bg-semantic-fill-default m-auto w-80 flex-col rounded-3xl p-0 shadow-[0_4px_32px_var(--color-semantic-shadow-default)] outline-none open:flex",
        "backdrop:bg-semantic-background-dim",
        className,
      )}>
      <div className="flex min-h-[102px] w-full flex-col gap-2 px-6 pt-6 pb-2 [letter-spacing:var(--letter-spacing-default)] break-words">
        <h2 id={titleId} className="text-semantic-text-strong [font:var(--semantic-title-small)]">
          {title}
        </h2>
        {description && (
          <p
            id={descriptionId}
            className="text-semantic-text-secondary [font:var(--semantic-body-medium)]">
            {description}
          </p>
        )}
      </div>
      {props.kind === "alert" ? (
        <div className="flex w-full items-center justify-end gap-2 pt-3 pr-5 pb-5 pl-4">
          <TextButton
            size="large"
            color={props.confirmColor ?? "brand"}
            rightIcon={false}
            label={props.confirmLabel ?? "확인"}
            onClick={props.onConfirm}
          />
        </div>
      ) : (
        <div
          className={cn(
            "flex w-full items-center justify-center gap-2 px-4 pt-6 pb-4",
            isVertical && "flex-col",
          )}>
          {/* 세로 배치는 '예'가 위라서, Tab 순서도 화면 순서와 같도록 DOM 순서 자체를 바꾼다 */}
          {isVertical && confirmButton}
          <Button size="large" variant="ghost" className={buttonClassName} onClick={props.onCancel}>
            {props.cancelLabel ?? "아니오"}
          </Button>
          {!isVertical && confirmButton}
        </div>
      )}
    </dialog>
  );
}
