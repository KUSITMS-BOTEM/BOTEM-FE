"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import Image from "next/image";

import { cn } from "@/utils/cn";
import IconButton from "@/components/IconButton";
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
const PROFILE_COLORS = Object.keys(PROFILE_FALLBACKS) as ProfileColor[];

export type ProfileColor = "orange" | "pink" | "lime" | "blue";

// 같은 사용자는 어디서나 같은 색이 되도록 id로 결정한다
export const getProfileColor = (userId: number): ProfileColor =>
  PROFILE_COLORS[userId % PROFILE_COLORS.length];

type ProfileProps = {
  imageUrl?: string;
  color?: ProfileColor;
  onImageChange?: (file: File) => void;
  allowedTypes?: string[];
  maxSizeBytes?: number;
  showIconButton?: boolean;
  className?: string;
};

const TOAST_DURATION_MS = 2500;
const DECODE_ERROR_MESSAGE = "이미지를 불러올 수 없어요. 다른 파일을 선택해주세요";

export default function Profile({
  imageUrl,
  color = "orange",
  onImageChange,
  allowedTypes,
  maxSizeBytes,
  showIconButton = true,
  className,
}: ProfileProps) {
  const Fallback = PROFILE_FALLBACKS[color];
  const inputRef = useRef<HTMLInputElement>(null);
  const latestRequestIdRef = useRef(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
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

  useEffect(() => {
    if (!errorText) return;
    const timer = setTimeout(() => setErrorText(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [errorText]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (allowedTypes && !allowedTypes.includes(file.type)) {
      setErrorText(
        `${allowedTypes.map(type => type.split("/")[1].replace("jpeg", "jpg")).join(", ")} 파일만 올릴 수 있어요`,
      );
      return;
    }
    if (maxSizeBytes && file.size > maxSizeBytes) {
      setErrorText(`${Math.floor(maxSizeBytes / (1024 * 1024))}MB 이하의 파일만 올릴 수 있어요`);
      return;
    }

    // 파일 선택 사이 디코딩이 끝나는 순서가 뒤바뀌어도 가장 마지막 선택만 반영되도록 요청 id로 추적한다
    const requestId = ++latestRequestIdRef.current;
    // 확장자만 이미지인 손상된 파일·텍스트 파일도 accept 필터를 통과할 수 있어 디코딩으로 직접 검증한다
    try {
      const bitmap = await createImageBitmap(file);
      bitmap.close();
      if (requestId !== latestRequestIdRef.current) return;
      setErrorText(null);
      setSelectedFile(file);
      onImageChange?.(file);
    } catch {
      if (requestId !== latestRequestIdRef.current) return;
      setErrorText(DECODE_ERROR_MESSAGE);
    }
  };

  const displayUrl = previewUrl ?? imageUrl;

  return (
    <div className={cn("relative size-[68px]", className)}>
      <div className="relative size-full overflow-hidden rounded-full">
        {displayUrl && !imageLoadError ? (
          <Image
            src={displayUrl}
            alt="프로필 이미지"
            fill
            unoptimized
            className="object-cover"
            onError={() => setImageLoadError(true)}
          />
        ) : (
          <Fallback className="size-full" />
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
