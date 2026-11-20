import ShimmerBar from "@/components/skeleton/ShimmerBar";
import FundingProgressCardSkeleton from "@/widgets/funding/skeleton/FundingProgressCardSkeleton";

export default function FundingDetailViewSkeleton() {
  return (
    <main aria-busy="true" aria-label="펀딩 불러오는 중" className="flex min-h-dvh flex-col">
      <div className="flex flex-col gap-4 px-5 pt-14">
        <div className="flex flex-col gap-3">
          <ShimmerBar className="h-7 w-3/5" />
          <ShimmerBar className="h-4 w-4/5" />
        </div>
        <div className="relative aspect-320/401 w-full">
          <FundingProgressCardSkeleton />
        </div>
      </div>
    </main>
  );
}
