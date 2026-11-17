"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import Image, { type StaticImageData } from "next/image";

import { cn } from "@/utils/cn";
import ToastMessage from "@/components/ToastMessage";
import { useImageFileSelect } from "@/hooks/useImageFileSelect";
import IconPlus from "@/assets/icons/icon-plus.svg?react";
import IconRemove from "@/assets/icons/multicolor/sticker-remove.svg?react";

type AssetSlotProps =
  | {
      type: "icon";
      asset?: ReactNode;
      onClick?: () => void;
      // asset이 있을 때만 우측 상단에 삭제 버튼이 생긴다
      onRemove?: () => void;
      // 스티커를 붙일 자리로 안내할 때 비어 있는 슬롯을 실선 테두리로 강조한다
      active?: boolean;
      className?: string;
    }
  | {
      type: "photo";
      src?: string | StaticImageData;
      // 사진을 고를 수 있는 상태일 때만 눌리게 한다
      disabled?: boolean;
      onImageChange?: (file: File) => void;
      allowedTypes?: string[];
      maxSizeBytes?: number;
      className?: string;
    };

const EMPTY_SLOT_CLASS = "border border-dashed border-semantic-icon-default";
const ACTIVE_SLOT_CLASS =
  "border-[1.5px] border-solid border-semantic-icon-default bg-semantic-fill-default/70";

export default function AssetSlot(props: AssetSlotProps) {
  return props.type === "icon" ? <IconSlot {...props} /> : <PhotoSlot {...props} />;
}

function IconSlot({
  asset,
  onClick,
  onRemove,
  active = false,
  className,
}: Extract<AssetSlotProps, { type: "icon" }>) {
  return (
    // 삭제 버튼이 슬롯 버튼 안에 중첩되지 않도록 둘을 형제로 두고, 위치·회전·크기는 이 래퍼가 가진다
    <div className={cn("relative size-[50px]", className)}>
      <button
        type="button"
        aria-label="아이콘 선택"
        onClick={onClick}
        className={cn(
          "flex size-full items-center justify-center overflow-hidden rounded-lg",
          active && "cursor-pointer",
          !asset && (active ? ACTIVE_SLOT_CLASS : EMPTY_SLOT_CLASS),
        )}>
        {asset ?? <IconPlus aria-hidden className="text-semantic-icon-default size-4" />}
      </button>
      {asset && onRemove && (
        <button
          type="button"
          aria-label="아이콘 삭제"
          onClick={onRemove}
          className="absolute -top-[6.2px] -right-[9.7px] size-5 cursor-pointer before:absolute before:-inset-2.5 before:content-['']">
          <IconRemove aria-hidden className="size-full" />
        </button>
      )}
    </div>
  );
}

function PhotoSlot({
  src,
  disabled = false,
  onImageChange,
  allowedTypes,
  maxSizeBytes,
  className,
}: Extract<AssetSlotProps, { type: "photo" }>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { errorText, handleFileChange } = useImageFileSelect({
    allowedTypes,
    maxSizeBytes,
    onSelect: file => {
      setPreviewUrl(URL.createObjectURL(file));
      onImageChange?.(file);
    },
  });

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const imageSrc = previewUrl ?? src;

  return (
    <>
      <button
        type="button"
        aria-label="사진 선택"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex size-[120px] items-center justify-center overflow-hidden rounded-lg",
          !disabled && "cursor-pointer",
          !imageSrc && EMPTY_SLOT_CLASS,
          className,
        )}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt="선택한 사진"
            fill
            sizes="120px"
            unoptimized={typeof imageSrc === "string"}
            className="object-cover"
          />
        ) : (
          <IconPlus aria-hidden className="text-semantic-icon-default size-7" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={handleFileChange}
      />
      <ToastMessage show={errorText !== null} text={errorText ?? ""} state={false} />
    </>
  );
}
