"use client";

import { useEffect, useMemo, useRef, type ChangeEvent } from "react";

import Image from "next/image";

import { cn } from "@/utils/cn";
import IconPlus from "@/assets/icons/icon-plus.svg?react";

type AddImageProps = {
  value: File | null;
  onChange: (file: File) => void;
  className?: string;
};

export default function AddImage({ value, onChange, className }: AddImageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onChange(file);
  };

  return (
    <div
      className={cn(
        "bg-semantic-fill-neutral-weak flex items-start justify-between rounded-3xl px-5 py-5",
        className,
      )}>
      <p className="text-semantic-text-tertiary [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-small-weak)]">
        상품 이미지
      </p>
      <button
        type="button"
        aria-label="상품 이미지 선택"
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
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  );
}
