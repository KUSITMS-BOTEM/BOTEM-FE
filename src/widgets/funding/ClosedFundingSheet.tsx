"use client";

import { type ComponentProps } from "react";

import CloseSheet from "@/components/CloseSheet";
import ListHeader from "@/components/ListHeader";
import FundedCard from "@/widgets/funding/FundedCard";

type ClosedFundingGroup = {
  closedDate: string;
  fundings: (ComponentProps<typeof FundedCard> & { fundingId: number })[];
};

// 마감된 펀딩 목록 API 명세가 나오기 전까지 Figma 시안 그대로 쓰는 임시 데이터
const TEMP_CLOSED_FUNDING_GROUPS: ClosedFundingGroup[] = [
  {
    closedDate: "2025.10.13",
    fundings: [
      {
        fundingId: 1,
        productName: "{상품명}",
        productImageUrl: "",
        fundingType: "BIRTHDAY",
        goalAchieved: true,
        participantCount: 8,
        proofStatus: "NEED",
      },
    ],
  },
  {
    closedDate: "2025.10.10",
    fundings: [
      {
        fundingId: 2,
        productName: "{상품명}",
        productImageUrl: "",
        fundingType: "BIRTHDAY",
        goalAchieved: true,
        participantCount: 8,
        proofStatus: "DONE",
      },
      {
        fundingId: 3,
        productName: "{상품명}",
        productImageUrl: "",
        fundingType: "SURPRISE",
        goalAchieved: false,
        participantCount: 6,
        recipientName: "서준",
      },
    ],
  },
];

type ClosedFundingSheetProps = {
  open: boolean;
  onClose: () => void;
};

export default function ClosedFundingSheet({ open, onClose }: ClosedFundingSheetProps) {
  return (
    <CloseSheet open={open} title="마감된 펀딩" closeType="back" onClose={onClose}>
      <div className="flex w-full flex-col gap-3">
        {TEMP_CLOSED_FUNDING_GROUPS.map(group => (
          <section key={group.closedDate} className="flex flex-col">
            <ListHeader title={group.closedDate} />
            {group.fundings.map(({ fundingId, ...funding }) => (
              <FundedCard key={fundingId} {...funding} />
            ))}
          </section>
        ))}
      </div>
    </CloseSheet>
  );
}
