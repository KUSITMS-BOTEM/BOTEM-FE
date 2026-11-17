"use client";

import { useId } from "react";

import Image from "next/image";
import Link from "next/link";

import type { FriendFundingResponse } from "@/types/friend/friend";
import { cn } from "@/utils/cn";
import { formatParticipantCaption } from "@/utils/friend/formatParticipantCaption";
import { formatDeadlineShort } from "@/utils/funding/formatDeadline";
import { calcFundingPercent } from "@/utils/funding/fundingProgress";
import { getDDayLabel } from "@/utils/funding/getDDayLabel";
import { isValidUrl } from "@/utils/isValidUrl";
import FriendSurpriseInfoButton from "@/widgets/friend/FriendSurpriseInfoButton";
import ProgressBar from "@/widgets/home/ProgressBar";
import IconSurprise from "@/assets/icons/multicolor/icon-surprise.svg?react";

type FriendFundingItemProps = {
  funding: FriendFundingResponse;
};

export default function FriendFundingItem({ funding }: FriendFundingItemProps) {
  const productNameId = useId();
  const percent = calcFundingPercent(funding.currentAmount, funding.targetAmount);
  const dDay = getDDayLabel(funding.deadline);
  const deadlineText = `펀딩 마감 ${formatDeadlineShort(funding.deadline)}${dDay ? ` · ${dDay}` : ""}`;
  const participantCaption = formatParticipantCaption(
    funding.representativeParticipantName,
    funding.participantCount,
  );
  const imageUrl =
    funding.productImageUrl && isValidUrl(funding.productImageUrl)
      ? funding.productImageUrl
      : undefined;

  return (
    <div className="relative w-full">
      <Link href={`/share/${funding.fundingId}`} className="flex w-full flex-col">
        <div className="flex w-full items-center gap-3 py-3">
          <div className="border-semantic-border-weak bg-semantic-fill-neutral-weak rounded-large relative size-14 shrink-0 overflow-hidden border">
            {imageUrl && (
              <Image src={imageUrl} alt="" fill sizes="56px" unoptimized className="object-cover" />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 [letter-spacing:var(--letter-spacing-default)] [&>p]:truncate">
            {funding.isSurprise ? (
              <p className="text-base-orange-500 flex items-center gap-0.5 [font:var(--semantic-label-x-small)]">
                <IconSurprise aria-hidden className="shrink-0" />
                서프라이즈
              </p>
            ) : (
              <p className="text-semantic-text-secondary [font:var(--semantic-subtext-medium)]">
                {funding.title}
              </p>
            )}
            <p
              id={productNameId}
              className="text-semantic-text-primary [font:var(--semantic-label-small)]">
              {funding.productName}
            </p>
            <p
              className={cn(
                funding.isSurprise
                  ? "text-semantic-text-secondary [font:var(--semantic-subtext-medium)]"
                  : "text-semantic-text-tertiary [font:var(--semantic-subtext-small)]",
              )}>
              {deadlineText}
            </p>
          </div>
          {/* ⓘ 버튼은 링크 안에 중첩할 수 없어 바깥에 겹쳐 두고, 그 자리만 비워 둔다 */}
          {funding.isSurprise && <span aria-hidden className="size-5 shrink-0" />}
        </div>
        <div className="flex w-full flex-col gap-0.5">
          <ProgressBar progress={percent} aria-labelledby={productNameId} />
          <div className="text-semantic-text-tertiary flex w-full items-center justify-between gap-2 [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-subtext-medium)]">
            <span className="min-w-0 truncate">{participantCaption}</span>
            <span className="shrink-0">{percent}% 달성</span>
          </div>
        </div>
      </Link>
      {funding.isSurprise && (
        <FriendSurpriseInfoButton className="absolute top-[26.5px] -right-1" />
      )}
    </div>
  );
}
