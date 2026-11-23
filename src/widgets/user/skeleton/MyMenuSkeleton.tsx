import ShimmerBar from "@/components/skeleton/ShimmerBar";

const LIST_ROW_COUNT = 6;

export default function MyMenuSkeleton() {
  return (
    <div role="status" aria-label="메뉴 불러오는 중" className="flex w-full flex-col gap-4">
      <div className="flex w-full flex-col">
        <ShimmerBar className="my-2 h-4.5 w-20" />
        <div className="flex w-full items-center gap-4 py-3">
          <ShimmerBar className="size-9 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <ShimmerBar className="h-5 w-2/5" />
            <ShimmerBar className="h-4 w-3/5" />
          </div>
        </div>
      </div>
      <div aria-hidden className="bg-semantic-border-weak -mx-5 h-px" />
      <div className="flex w-full flex-col">
        {Array.from({ length: LIST_ROW_COUNT }, (_, i) => (
          <div key={i} className="flex w-full items-center gap-3 py-3">
            <ShimmerBar className="size-6 shrink-0" />
            <ShimmerBar className="h-5 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
