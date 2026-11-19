import ShimmerBar from "@/components/skeleton/ShimmerBar";

const SKELETON_ROW_COUNT = 2;

export default function GiftVerificationListSkeleton() {
  return (
    <div role="status" aria-label="인증할 선물을 불러오는 중" className="flex w-full flex-col">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <div key={index} className="flex w-full items-center gap-3 py-3">
          <ShimmerBar className="rounded-large size-14 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <ShimmerBar className="h-5 w-32" />
            <ShimmerBar className="h-4 w-40" />
          </div>
          <ShimmerBar className="h-8 w-[66px] rounded-full" />
        </div>
      ))}
    </div>
  );
}
