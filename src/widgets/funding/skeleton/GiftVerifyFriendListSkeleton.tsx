import ShimmerBar from "@/components/skeleton/ShimmerBar";

const SKELETON_ROW_COUNT = 3;

export default function GiftVerifyFriendListSkeleton() {
  return (
    <div role="status" aria-label="함께한 친구를 불러오는 중" className="flex w-full flex-col">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <div key={index} className="flex w-full items-center gap-3 py-3">
          <ShimmerBar className="size-9 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <ShimmerBar className="h-4 w-16" />
            <ShimmerBar className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
