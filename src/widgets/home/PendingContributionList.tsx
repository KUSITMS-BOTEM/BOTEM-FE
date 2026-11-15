import Button from "@/components/Button";
import DepositConfirmedAnimation from "@/components/effects/DepositConfirmedAnimation";
import ListHeader from "@/components/ListHeader";
import ShimmerBar from "@/components/skeleton/ShimmerBar";
import type { PendingContributionResponse } from "@/types/contribution/contribution";
import PendingContributionItem from "@/widgets/home/PendingContributionItem";

const SKELETON_COUNT = 2;

type PendingContributionListProps = {
  contributions?: PendingContributionResponse[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
};

export default function PendingContributionList({
  contributions,
  isLoading,
  isError,
  onRetry,
  selectedIds,
  onSelectedIdsChange,
}: PendingContributionListProps) {
  if (isLoading) {
    return (
      <div aria-busy className="flex w-full flex-col gap-3">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <ShimmerBar key={index} className="h-[82px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError && !contributions) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
          보탬 내역을 불러오지 못했어요
        </p>
        <Button onClick={onRetry}>다시 시도</Button>
      </div>
    );
  }

  if (!contributions) return null;

  if (contributions.length === 0) {
    return (
      <div className="flex h-[268px] w-full flex-col items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-3">
          <DepositConfirmedAnimation />
          <p className="text-semantic-text-quaternary [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-small)]">
            모든 내역을 확인했어요
          </p>
        </div>
      </div>
    );
  }

  const toggle = (contributionId: number, checked: boolean) =>
    onSelectedIdsChange(
      checked ? [...selectedIds, contributionId] : selectedIds.filter(id => id !== contributionId),
    );

  return (
    <div className="flex w-full flex-col gap-3">
      <ListHeader title={`미확인 보탬 ${contributions.length}건`} />
      {contributions.map(({ contributionId, senderName, depositMethod }) => (
        <PendingContributionItem
          key={contributionId}
          senderName={senderName}
          depositMethod={depositMethod}
          checked={selectedIds.includes(contributionId)}
          onCheckedChange={checked => toggle(contributionId, checked)}
        />
      ))}
    </div>
  );
}
