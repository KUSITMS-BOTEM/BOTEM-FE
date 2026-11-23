"use client";

import { type ReactNode, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import Button from "@/components/Button";
import ListHeader from "@/components/ListHeader";
import { SLIDE_TRANSITION } from "@/constants/motion";
import type { FriendFundingResponse } from "@/types/friend/friend";
import { cn } from "@/utils/cn";
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
  const collapsedFundings = fundings.slice(0, COLLAPSED_COUNT);
  const extraFundings = fundings.slice(COLLAPSED_COUNT);

  // 펼칠 때 간격이 튀지 않도록 gap 대신 항목 안쪽 여백으로 띄운다
  const renderItem = (funding: FriendFundingResponse, index: number) => (
    <div className={cn(index > 0 && "pt-2")}>
      <FriendFundingItem funding={funding} />
    </div>
  );

  return (
    <section className="flex w-full flex-col gap-2">
      <ListHeader title={`진행중인 펀딩 ${fundings.length}개`} />
      {notice}
      <ul className="flex w-full flex-col">
        {collapsedFundings.map((funding, index) => (
          <li key={funding.fundingId}>{renderItem(funding, index)}</li>
        ))}
        <AnimatePresence initial={false}>
          {expanded &&
            extraFundings.map((funding, index) => (
              <motion.li
                key={funding.fundingId}
                className="overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={SLIDE_TRANSITION}>
                {renderItem(funding, COLLAPSED_COUNT + index)}
              </motion.li>
            ))}
        </AnimatePresence>
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
