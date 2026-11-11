"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import Image from "next/image";

import { cn } from "@/utils/cn";
import ToastMessage from "@/components/ToastMessage";
import IconPlus from "@/assets/icons/icon-plus.svg?react";

type AddImageProps = {
  value: File | null;
  onChange: (file: File) => void;
  className?: string;
};

const TOAST_DURATION_MS = 2500;
const DECODE_ERROR_MESSAGE = "이미지를 불러올 수 없어요. 다른 파일을 선택해주세요";

export default function AddImage({ value, onChange, className }: AddImageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

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

  useEffect(() => {
    if (!errorText) return;
    const timer = setTimeout(() => setErrorText(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [errorText]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    // 확장자만 이미지인 손상된 파일·텍스트 파일도 accept 필터를 통과할 수 있어 디코딩으로 직접 검증한다
    try {
      const bitmap = await createImageBitmap(file);
      bitmap.close();
      setErrorText(null);
      onChange(file);
    } catch {
      setErrorText(DECODE_ERROR_MESSAGE);
    }
  };

  return (
    <div className="flex flex-col gap-2">
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
      <ToastMessage show={errorText !== null} text={errorText ?? ""} state={false} />
    </div>
  );
}
