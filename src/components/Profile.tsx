"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import Image from "next/image";

import { cn } from "@/utils/cn";
import IconButton from "@/components/IconButton";
import ToastMessage from "@/components/ToastMessage";
import ProfileOrange from "@/assets/icons/multicolor/profile-orange.svg?react";
import IconPlus from "@/assets/icons/icon-plus.svg?react";

type ProfileProps = {
  imageUrl?: string;
  onImageChange?: (file: File) => void;
  showIconButton?: boolean;
  className?: string;
};

const TOAST_DURATION_MS = 2500;
const DECODE_ERROR_MESSAGE = "이미지를 불러올 수 없어요. 다른 파일을 선택해주세요";

export default function Profile({
  imageUrl,
  onImageChange,
  showIconButton = true,
  className,
}: ProfileProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) return;
    const url = URL.createObjectURL(selectedFile);
    // objectURL 생성이 브라우저 리소스를 할당하는 부수효과라 렌더/useMemo가 아닌 이펙트에서 생성·해제를 같이 묶어야 함
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [selectedFile]);

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
      setSelectedFile(file);
      onImageChange?.(file);
    } catch {
      setErrorText(DECODE_ERROR_MESSAGE);
    }
  };

  const displayUrl = previewUrl ?? imageUrl;

  return (
    <div className={cn("relative size-[68px]", className)}>
      <div className="size-full overflow-hidden rounded-full">
        {displayUrl ? (
          <Image src={displayUrl} alt="프로필 이미지" fill unoptimized className="object-cover" />
        ) : (
          <ProfileOrange className="size-full" />
        )}
      </div>
      {showIconButton && (
        <>
          <IconButton
            size="small"
            variant="stroke"
            icon={<IconPlus />}
            aria-label="프로필 이미지 선택"
            onClick={() => inputRef.current?.click()}
            className="absolute right-[-7px] bottom-0"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </>
      )}
      <ToastMessage show={errorText !== null} text={errorText ?? ""} state={false} />
    </div>
  );
}
