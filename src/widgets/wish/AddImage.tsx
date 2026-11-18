"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { cn } from "@/utils/cn";
import { useImageFileSelect } from "@/hooks/useImageFileSelect";
import ToastMessage from "@/components/ToastMessage";
import IconPlus from "@/assets/icons/icon-plus.svg?react";

type AddImageProps = {
  value: File | null;
  onChange: (file: File) => void;
  label?: string;
  allowedTypes?: string[];
  maxSizeBytes?: number;
  className?: string;
};

export default function AddImage({
  value,
  onChange,
  label = "상품 이미지",
  allowedTypes,
  maxSizeBytes,
  className,
}: AddImageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { errorText, handleFileChange } = useImageFileSelect({
    allowedTypes,
    maxSizeBytes,
    onSelect: onChange,
  });

  useEffect(() => {
    if (!value) return;
    const url = URL.createObjectURL(value);
    // objectURL 생성이 브라우저 리소스를 할당하는 부수효과라 렌더/useMemo가 아닌 이펙트에서 생성·해제를 같이 묶어야 함
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "bg-semantic-fill-neutral-weak flex items-start justify-between rounded-3xl px-5 py-5",
          className,
        )}>
        <p className="text-semantic-text-tertiary [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-small-weak)]">
          {label}
        </p>
        <button
          type="button"
          aria-label={`${label} 선택`}
          onClick={() => inputRef.current?.click()}
          className="border-semantic-border-primary border-medium relative size-36 shrink-0 cursor-pointer overflow-hidden rounded-3xl border-dashed">
          {previewUrl ? (
            <Image src={previewUrl} alt="" fill unoptimized className="object-cover" />
          ) : (
            <span className="bg-semantic-fill-default/70 flex size-full items-center justify-center">
              <IconPlus aria-hidden className="size-7" />
            </span>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={allowedTypes?.join(",") ?? "image/*"}
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>
      <ToastMessage show={errorText !== null} text={errorText ?? ""} state={false} />
    </div>
  );
}
