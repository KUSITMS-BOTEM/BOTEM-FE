"use client";

import { useState } from "react";

import Image from "next/image";

import { cn } from "@/utils/cn";
import Asset from "@/components/Asset";
import Badge from "@/components/Badge";
import ListText from "@/components/ListText";
import type { FundingType } from "@/types/home/home";
import IconRight from "@/assets/icons/icon-right.svg?react";

export type FundedCardProofStatus = "NEED" | "DONE";

type FundedCardProps = {
  productName: string;
  productImageUrl: string;
  fundingType: FundingType;
  goalAchieved: boolean;
  participantCount: number;
  proofStatus?: FundedCardProofStatus;
  recipientName?: string;
  className?: string;
};

export default function FundedCard({
  productName,
  productImageUrl,
  fundingType,
  goalAchieved,
  participantCount,
  proofStatus,
  recipientName,
  className,
}: FundedCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const description = `${goalAchieved ? "목표 달성" : "모인 만큼 전달"} · ${participantCount}명 참여`;

  return (
    <div className={cn("flex w-full items-center gap-3 py-3", className)}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="border-semantic-border-weak bg-semantic-fill-neutral-weak rounded-x-large relative size-20 shrink-0 overflow-hidden border">
          {productImageUrl && !imageFailed && (
            <Image
              src={productImageUrl}
              alt=""
              fill
              sizes="80px"
              unoptimized
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <ListText title={productName} description={description} />
          <div className="flex gap-1.5">
            {fundingType === "BIRTHDAY" ? (
              <>
                {proofStatus === "NEED" && <Badge color="danger" label="인증 필요" />}
                {proofStatus === "DONE" && <Badge color="brand" variant="weak" label="인증 완료" />}
                <Badge variant="weak" label="내 생일" />
              </>
            ) : (
              <Badge variant="weak" label={`${recipientName ?? ""} 서프라이즈`} />
            )}
          </div>
        </div>
      </div>
      <Asset icon={<IconRight />} size="small" className="text-semantic-icon-default" />
    </div>
  );
}
