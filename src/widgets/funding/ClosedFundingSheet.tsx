"use client";

import CloseSheet from "@/components/CloseSheet";
import TextButton from "@/components/TextButton";
import { useClosedFundingsQuery } from "@/hooks/queries/funding/useClosedFundingsQuery";
import ClosedFundingList from "@/widgets/funding/ClosedFundingList";
import ClosedFundingListSkeleton from "@/widgets/funding/skeleton/ClosedFundingListSkeleton";

type ClosedFundingSheetProps = {
  open: boolean;
  onClose: () => void;
};

export default function ClosedFundingSheet({ open, onClose }: ClosedFundingSheetProps) {
  const { data, isPending, isError, refetch } = useClosedFundingsQuery(open);
  const fundings = data?.fundings ?? [];

  return (
    <CloseSheet open={open} title="마감된 펀딩" closeType="back" onClose={onClose}>
      {isPending ? (
        <ClosedFundingListSkeleton />
      ) : isError ? (
        <div className="text-semantic-text-secondary flex flex-1 flex-col items-center justify-center gap-2">
          <p>마감된 펀딩을 불러오지 못했어요.</p>
          <TextButton size="medium" label="다시 시도" rightIcon={false} onClick={() => refetch()} />
        </div>
      ) : fundings.length === 0 ? (
        <p className="text-semantic-text-secondary flex flex-1 items-center justify-center">
          마감된 펀딩이 없어요.
        </p>
      ) : (
        <ClosedFundingList fundings={fundings} />
      )}
    </CloseSheet>
  );
}
