import ShimmerBar from "@/components/skeleton/ShimmerBar";

export default function ClosedFundingListSkeleton() {
  return (
    <div role="status" aria-label="마감된 펀딩 불러오는 중" className="flex w-full flex-col">
      <ShimmerBar className="my-2 h-4.5 w-24" />
      {[0, 1, 2].map(i => (
        <div key={i} className="flex w-full items-center gap-3 py-3">
          <ShimmerBar className="rounded-x-large size-20 shrink-0" />
          <div className="flex flex-1 flex-col gap-2">
            <ShimmerBar className="h-5 w-3/5" />
            <ShimmerBar className="h-4 w-2/5" />
            <ShimmerBar className="h-6 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
