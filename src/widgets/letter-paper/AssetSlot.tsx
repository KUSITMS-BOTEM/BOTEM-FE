"use client";

import { useRef, type ReactNode } from "react";

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
      // 슬롯이 둘 이상일 때 스크린리더가 구분하도록 접근 가능한 이름 앞에 붙인다
      label?: string;
      className?: string;
    }
  | {
      type: "photo";
      src?: string | StaticImageData;
      // 사진을 고를 수 있는 상태일 때만 눌리게 한다
      disabled?: boolean;
      // 사진을 붙일 자리로 안내할 때 비어 있는 슬롯을 실선 테두리로 강조한다
      active?: boolean;
      // 사진이 있을 때만 좌측 상단에 삭제 버튼이 생긴다(우측 상단의 작은 아이콘 슬롯과 겹치지 않게)
      onRemove?: () => void;
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
  label = "아이콘",
  className,
}: Extract<AssetSlotProps, { type: "icon" }>) {
  return (
    // 삭제 버튼이 슬롯 버튼 안에 중첩되지 않도록 둘을 형제로 두고, 위치·회전·크기는 이 래퍼가 가진다
    <div className={cn("relative size-[50px]", className)}>
      <button
        type="button"
        aria-label={`${label} 선택`}
        disabled={!onClick}
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
          aria-label={`${label} 삭제`}
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
  active = false,
  onRemove,
  onImageChange,
  allowedTypes,
  maxSizeBytes,
  className,
}: Extract<AssetSlotProps, { type: "photo" }>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { errorText, handleFileChange } = useImageFileSelect({
    allowedTypes,
    maxSizeBytes,
    onSelect: file => onImageChange?.(file),
  });

  // 미리보기 URL은 부모가 만들어 src로 내려준다(생성·해제도 부모 몫)
  const imageSrc = src;

  return (
    <>
      {/* 삭제 버튼이 슬롯 버튼 안에 중첩되지 않도록 둘을 형제로 두고, 위치·회전은 이 래퍼가 가진다 */}
      <div className={cn("relative size-[120px]", className)}>
        <button
          type="button"
          aria-label="사진 선택"
          // 사진이 있으면 다시 눌러도 선택창이 열리지 않는다(바꾸려면 삭제 후 다시 추가)
          disabled={disabled || !!imageSrc}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex size-full items-center justify-center overflow-hidden rounded-lg",
            !disabled && !imageSrc && "cursor-pointer",
            !imageSrc && (active ? ACTIVE_SLOT_CLASS : EMPTY_SLOT_CLASS),
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
        {imageSrc && onRemove && (
          <button
            type="button"
            aria-label="사진 삭제"
            onClick={onRemove}
            className="absolute -top-[12px] -left-[10px] size-5 cursor-pointer before:absolute before:-inset-2.5 before:content-['']">
            <IconRemove aria-hidden className="size-full" />
          </button>
        )}
      </div>
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
