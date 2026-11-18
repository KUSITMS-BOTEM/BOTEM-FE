"use client";

import { type ComponentProps, type ReactNode, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { cn } from "@/utils/cn";
import Asset from "@/components/Asset";
import ListText from "@/components/ListText";
import IconLock from "@/assets/icons/icon-lock.svg?react";
import LockedThumbnail from "@/assets/images/locked-thumbnail.png";

type ListType = "product" | "default";

type ListProps = {
  type?: ListType;
  leading?: ReactNode;
  thumbnailSrc?: string | StaticImageData;
  thumbnailAlt?: string;
  thumbnailLocked?: boolean;
  title: string;
  description?: string;
  caption?: string;
  titleUp?: boolean;
  textType?: ComponentProps<typeof ListText>["type"];
  right?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export default function List({
  type = "default",
  leading,
  thumbnailSrc,
  thumbnailAlt = "",
  thumbnailLocked = false,
  title,
  description,
  caption,
  titleUp = false,
  textType,
  right,
  onClick,
  className,
}: ListProps) {
  const isProduct = type === "product";
  const [failedSrc, setFailedSrc] = useState<string | StaticImageData>();
  // 잠긴 썸네일은 실제 상품 대신 Figma 샘플 이미지를 블러 뒤에 깔아 질감을 낸다
  const imageSrc = thumbnailSrc ?? (thumbnailLocked ? LockedThumbnail : undefined);
  const showThumbnail = imageSrc && imageSrc !== failedSrc;
  const rootClassName = cn("flex w-full items-center gap-3 py-3", className);

  const content = (
    <>
      <div className={cn("flex min-w-0 flex-1 items-center", isProduct ? "gap-3" : "gap-2")}>
        {isProduct ? (
          <div className="border-semantic-border-weak bg-semantic-fill-neutral-weak rounded-large relative size-14 shrink-0 overflow-hidden border">
            {showThumbnail && (
              <Image
                src={imageSrc}
                alt={thumbnailAlt}
                fill
                sizes="56px"
                unoptimized
                className="object-cover"
                onError={() => setFailedSrc(imageSrc)}
              />
            )}
            {thumbnailLocked && (
              <span className="bg-semantic-background-default/70 absolute inset-0 flex items-center justify-center backdrop-blur-lg">
                <Asset
                  icon={<IconLock aria-hidden />}
                  size="xsmall"
                  className="text-semantic-icon-primary"
                />
              </span>
            )}
          </div>
        ) : (
          leading && (
            <span className="bg-semantic-fill-neutral-weak rounded-x-large flex size-11 shrink-0 items-center justify-center">
              <Asset icon={leading} size="medium" className="text-semantic-icon-default" />
            </span>
          )
        )}
        <ListText
          title={title}
          description={description}
          caption={caption}
          titleUp={titleUp}
          type={textType}
          className="flex-1"
        />
      </div>
      {right && <div className="flex shrink-0 items-center">{right}</div>}
    </>
  );

  // onClick이 있으면 행 전체가 버튼이 되므로 right에 또 다른 버튼을 넣으면 중첩 interactive가 된다
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(rootClassName, "cursor-pointer text-left")}>
        {content}
      </button>
    );
  }

  return <div className={rootClassName}>{content}</div>;
}
