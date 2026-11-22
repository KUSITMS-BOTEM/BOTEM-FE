"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/utils/cn";
import Asset from "@/components/Asset";
import Badge from "@/components/Badge";
import ListText from "@/components/ListText";
import type { ClosedFundingRelationship } from "@/types/funding/closedFunding";
import type { FundingType } from "@/types/home/home";
import IconRight from "@/assets/icons/icon-right.svg?react";

const RELATIONSHIP_LABEL: Record<ClosedFundingRelationship, string> = {
  OPENED: "내가 열었어요",
  RECEIVED: "내가 받았어요",
  PARTICIPATED: "내가 참여했어요",
};

type FundedCardProps = {
  productName: string;
  productImageUrl: string;
  relationship: ClosedFundingRelationship;
  fundingType: FundingType;
  celebrantName: string;
  rollingPaperCount: number | null;
  href?: string;
  className?: string;
};

const getTypeLabel = ({
  relationship,
  fundingType,
  celebrantName,
}: Pick<FundedCardProps, "relationship" | "fundingType" | "celebrantName">) => {
  if (fundingType === "SURPRISE") return `${celebrantName} 서프라이즈`;
  return relationship === "OPENED" ? "내 생일" : `${celebrantName}의 생일`;
};

export default function FundedCard({
  productName,
  productImageUrl,
  relationship,
  fundingType,
  celebrantName,
  rollingPaperCount,
  href,
  className,
}: FundedCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const description = rollingPaperCount === null ? undefined : `${rollingPaperCount}명 참여`;
  const rootClassName = cn("flex w-full items-center gap-3 py-3", className);

  const content = (
    <>
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
            <Badge variant="weak" label={RELATIONSHIP_LABEL[relationship]} />
            <Badge
              variant="weak"
              label={getTypeLabel({ relationship, fundingType, celebrantName })}
            />
          </div>
        </div>
      </div>
      {href && <Asset icon={<IconRight />} size="small" className="text-semantic-icon-default" />}
    </>
  );

  return href ? (
    <Link href={href} className={rootClassName}>
      {content}
    </Link>
  ) : (
    <div className={rootClassName}>{content}</div>
  );
}
