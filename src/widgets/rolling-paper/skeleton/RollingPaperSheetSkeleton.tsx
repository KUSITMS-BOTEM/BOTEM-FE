import ShimmerBar from "@/components/skeleton/ShimmerBar";

export default function RollingPaperSheetSkeleton() {
  return (
    <div
      aria-busy
      className="relative -mx-5 -mt-1 flex w-[calc(100%+2.5rem)] flex-1 flex-col px-5 pb-[calc(103.5px+env(safe-area-inset-bottom))]">
      <span className="sr-only">롤링페이퍼를 불러오는 중이에요</span>
      <div aria-hidden className="mb-[6.5px] flex h-[91px] shrink-0 flex-col gap-2">
        <ShimmerBar className="h-7 w-3/5" />
        <ShimmerBar className="h-7 w-2/5" />
      </div>
      <ShimmerBar
        aria-hidden
        className="rounded-x-large max-h-[518px] min-h-[387px] w-full flex-1"
      />
    </div>
  );
}
