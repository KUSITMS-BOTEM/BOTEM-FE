"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { cn } from "@/utils/cn";
import { isKakaoDefaultImage } from "@/utils/isKakaoDefaultImage";
import type { Color } from "@/constants/color";
import { useImageFileSelect } from "@/hooks/useImageFileSelect";
import IconButton from "@/components/IconButton";
import LoadingAnimation from "@/components/LoadingAnimation";
import ToastMessage from "@/components/ToastMessage";
import ProfileOrange from "@/assets/icons/multicolor/profile-orange.svg?react";
import ProfilePink from "@/assets/icons/multicolor/profile-pink.svg?react";
import ProfileLime from "@/assets/icons/multicolor/profile-lime.svg?react";
import ProfileBlue from "@/assets/icons/multicolor/profile-blue.svg?react";
import IconPlus from "@/assets/icons/icon-plus.svg?react";

const PROFILE_FALLBACKS = {
  orange: ProfileOrange,
  pink: ProfilePink,
  lime: ProfileLime,
  blue: ProfileBlue,
};
const PROFILE_COLORS = Object.keys(PROFILE_FALLBACKS) as Color[];

// 같은 사용자는 어디서나 같은 색이 되도록 id로 결정한다
export const getProfileColor = (userId: number): Color =>
  PROFILE_COLORS[userId % PROFILE_COLORS.length];

type ProfileProps = {
  imageUrl?: string;
  alt?: string;
  color?: Color;
  onImageChange?: (file: File) => void;
  allowedTypes?: string[];
  maxSizeBytes?: number;
  showIconButton?: boolean;
  isUploading?: boolean;
  className?: string;
};

export default function Profile({
  imageUrl,
  alt = "프로필 이미지",
  color = "orange",
  onImageChange,
  allowedTypes,
  maxSizeBytes,
  showIconButton = true,
  isUploading = false,
  className,
}: ProfileProps) {
  const Fallback = PROFILE_FALLBACKS[color];
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { errorText, handleFileChange } = useImageFileSelect({
    allowedTypes,
    maxSizeBytes,
    onSelect: file => {
      setSelectedFile(file);
      onImageChange?.(file);
    },
  });
  const [syncedImageUrl, setSyncedImageUrl] = useState(imageUrl);
  const [imageLoadError, setImageLoadError] = useState(false);

  // 업로드 성공으로 서버의 imageUrl이 갱신되면 로컬 미리보기를 내려 서버 URL이 보이게 한다 — effect가 아닌 렌더 중 동기화
  if (imageUrl !== syncedImageUrl) {
    setSyncedImageUrl(imageUrl);
    setSelectedFile(null);
    setImageLoadError(false);
  }

  useEffect(() => {
    if (!selectedFile) return;
    const url = URL.createObjectURL(selectedFile);
    // objectURL 생성이 브라우저 리소스를 할당하는 부수효과라 렌더/useMemo가 아닌 이펙트에서 생성·해제를 같이 묶어야 함
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(url);
    setImageLoadError(false);
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [selectedFile]);

  const displayUrl = previewUrl ?? imageUrl;

  return (
    // button 안에도 들어갈 수 있도록(From 영역) div 대신 span을 쓴다
    <span className={cn("relative block size-[68px]", className)} aria-busy={isUploading}>
      <span className="relative block size-full overflow-hidden rounded-full">
        {displayUrl && !isKakaoDefaultImage(displayUrl) && !imageLoadError ? (
          <Image
            src={displayUrl}
            alt={alt}
            fill
            unoptimized
            className="object-cover"
            onError={() => setImageLoadError(true)}
          />
        ) : (
          <Fallback className="size-full" />
        )}
        {isUploading && (
          <span
            role="status"
            aria-label="프로필 이미지 저장 중"
            className="bg-semantic-background-dim absolute inset-0 flex items-center justify-center">
            <LoadingAnimation size="small" color="white" />
          </span>
        )}
      </span>
      {showIconButton && (
        <>
          <IconButton
            size="small"
            variant="stroke"
            icon={<IconPlus />}
            aria-label="프로필 이미지 선택"
            disabled={isUploading}
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
    </span>
  );
}
