"use client";

import { type ReactNode, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { cn } from "@/utils/cn";
import Asset from "@/components/Asset";
import ListText from "@/components/ListText";

type ListType = "product" | "default";

type ListProps = {
  type?: ListType;
  leading?: ReactNode;
  thumbnailSrc?: string | StaticImageData;
  thumbnailAlt?: string;
  title: string;
  description?: string;
  right?: ReactNode;
  className?: string;
};

export default function List({
  type = "default",
  leading,
  thumbnailSrc,
  thumbnailAlt = "",
  title,
  description,
  right,
  className,
}: ListProps) {
  const isProduct = type === "product";
  const [failedSrc, setFailedSrc] = useState<string | StaticImageData>();
  const showThumbnail = thumbnailSrc && thumbnailSrc !== failedSrc;

  return (
    <div className={cn("flex w-full items-center gap-3 py-3", className)}>
      <div className={cn("flex min-w-0 flex-1 items-center", isProduct ? "gap-3" : "gap-2")}>
        {isProduct ? (
          <div className="border-semantic-border-weak bg-semantic-fill-neutral-weak rounded-large relative size-14 shrink-0 overflow-hidden border">
            {showThumbnail && (
              <Image
                src={thumbnailSrc}
                alt={thumbnailAlt}
                fill
                sizes="56px"
                className="object-cover"
                onError={() => setFailedSrc(thumbnailSrc)}
              />
            )}
          </div>
        ) : (
          leading && (
            <span className="bg-semantic-fill-neutral-weak rounded-x-large flex size-11 shrink-0 items-center justify-center">
              <Asset icon={leading} size="medium" className="text-semantic-icon-default" />
            </span>
          )
        )}
        <ListText title={title} description={description} className="flex-1" />
      </div>
      {right && <div className="flex shrink-0 items-center">{right}</div>}
    </div>
  );
}
