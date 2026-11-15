"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import Image, { type StaticImageData } from "next/image";

import { cn } from "@/utils/cn";
import ToastMessage from "@/components/ToastMessage";
import { useImageFileSelect } from "@/hooks/useImageFileSelect";
import IconPlus from "@/assets/icons/icon-plus.svg?react";

type AssetSlotProps =
  | {
      type: "icon";
      asset?: ReactNode;
      onClick?: () => void;
      className?: string;
    }
  | {
      type: "photo";
      src?: string | StaticImageData;
      onImageChange?: (file: File) => void;
      allowedTypes?: string[];
      maxSizeBytes?: number;
      className?: string;
    };

const EMPTY_SLOT_CLASS = "border border-dashed border-semantic-icon-default";

export default function AssetSlot(props: AssetSlotProps) {
  return props.type === "icon" ? <IconSlot {...props} /> : <PhotoSlot {...props} />;
}

function IconSlot({ asset, onClick, className }: Extract<AssetSlotProps, { type: "icon" }>) {
  return (
    <button
      type="button"
      aria-label="아이콘 선택"
      onClick={onClick}
      className={cn(
        "flex size-[50px] items-center justify-center overflow-hidden rounded-lg",
        !asset && EMPTY_SLOT_CLASS,
        className,
      )}>
      {asset ?? <IconPlus aria-hidden className="text-semantic-icon-default size-4" />}
    </button>
  );
}

function PhotoSlot({
  src,
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
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex size-[120px] items-center justify-center overflow-hidden rounded-lg",
          !imageSrc && EMPTY_SLOT_CLASS,
          className,
        )}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt="선택한 사진"
            fill
            sizes="120px"
            unoptimized={previewUrl !== null}
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
