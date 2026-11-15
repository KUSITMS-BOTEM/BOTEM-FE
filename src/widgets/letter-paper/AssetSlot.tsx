"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";

import Image from "next/image";

import { cn } from "@/utils/cn";
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
      onImageChange?: (file: File) => void;
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

function PhotoSlot({ onImageChange, className }: Extract<AssetSlotProps, { type: "photo" }>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    onImageChange?.(file);
  };

  return (
    <>
      <button
        type="button"
        aria-label="사진 선택"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex size-[120px] items-center justify-center overflow-hidden rounded-lg",
          !previewUrl && EMPTY_SLOT_CLASS,
          className,
        )}>
        {previewUrl ? (
          <Image src={previewUrl} alt="선택한 사진" fill unoptimized className="object-cover" />
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
    </>
  );
}
