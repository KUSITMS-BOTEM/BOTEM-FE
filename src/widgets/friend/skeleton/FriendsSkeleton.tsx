import ShimmerBar from "@/components/skeleton/ShimmerBar";

const UPCOMING_ROW_COUNT = 2;
const FRIEND_ROW_COUNT = 3;

function FriendRowSkeleton({ withDday = false }: { withDday?: boolean }) {
  return (
    <div className="flex w-full items-center gap-3 py-3">
      <ShimmerBar className="size-9 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-0.5">
        <ShimmerBar className="h-6 w-32" />
        <ShimmerBar className="h-5 w-24" />
        {withDday && <ShimmerBar className="h-4 w-28" />}
      </div>
    </div>
  );
}

export default function FriendsSkeleton() {
  return (
    <div aria-busy="true" aria-label="친구 목록 불러오는 중" className="flex w-full flex-col gap-3">
      <ShimmerBar className="h-8 w-20" />
      <div className="flex w-full flex-col">
        <ShimmerBar className="h-8 w-28" />
        {Array.from({ length: UPCOMING_ROW_COUNT }, (_, index) => (
          <FriendRowSkeleton key={index} withDday />
        ))}
      </div>
      <div aria-hidden className="bg-semantic-border-weak -mx-5 h-px" />
      <div className="flex w-full flex-col gap-0.5">
        {Array.from({ length: FRIEND_ROW_COUNT }, (_, index) => (
          <FriendRowSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
