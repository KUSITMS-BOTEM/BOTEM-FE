import ShimmerBar from "@/components/skeleton/ShimmerBar";

export default function FriendProfileSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="친구 프로필 불러오는 중"
      className="flex w-full flex-col gap-4">
      <div className="flex w-full items-center gap-3 py-3">
        <ShimmerBar className="size-9 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-1">
          <ShimmerBar className="h-6 w-16" />
          <ShimmerBar className="h-5 w-28" />
          <ShimmerBar className="h-4 w-32" />
        </div>
      </div>
      <div className="flex w-full flex-col gap-2">
        <ShimmerBar className="h-8 w-32" />
        {[0, 1].map(index => (
          <div key={index} className="flex w-full flex-col gap-3 py-3">
            <div className="flex items-center gap-3">
              <ShimmerBar className="rounded-large size-14 shrink-0" />
              <div className="flex flex-1 flex-col gap-1">
                <ShimmerBar className="h-4 w-20" />
                <ShimmerBar className="h-5 w-40" />
                <ShimmerBar className="h-4 w-32" />
              </div>
            </div>
            <ShimmerBar className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
