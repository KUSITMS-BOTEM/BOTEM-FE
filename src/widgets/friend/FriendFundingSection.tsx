"use client";

import { type ReactNode, useState } from "react";

import Button from "@/components/Button";
import ListHeader from "@/components/ListHeader";
import type { FriendFundingResponse } from "@/types/friend/friend";
import FriendFundingItem from "@/widgets/friend/FriendFundingItem";
import IconDown from "@/assets/icons/icon-down.svg?react";
import IconUp from "@/assets/icons/icon-up.svg?react";

const COLLAPSED_COUNT = 2;

type FriendFundingSectionProps = {
  fundings: FriendFundingResponse[];
  notice?: ReactNode;
};

export default function FriendFundingSection({ fundings, notice }: FriendFundingSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleFundings = expanded ? fundings : fundings.slice(0, COLLAPSED_COUNT);

  return (
    <section className="flex w-full flex-col gap-2">
      <ListHeader title={`진행중인 펀딩 ${fundings.length}개`} />
      {notice}
      <ul className="flex w-full flex-col gap-2">
        {visibleFundings.map(funding => (
          <li key={funding.fundingId}>
            <FriendFundingItem funding={funding} />
          </li>
        ))}
      </ul>
      {fundings.length > COLLAPSED_COUNT && (
        <Button
          variant="ghost"
          rightIcon={expanded ? <IconUp /> : <IconDown />}
          aria-expanded={expanded}
          className="w-full"
          onClick={() => setExpanded(prev => !prev)}>
          {expanded ? "접기" : "전체보기"}
        </Button>
      )}
    </section>
  );
}
