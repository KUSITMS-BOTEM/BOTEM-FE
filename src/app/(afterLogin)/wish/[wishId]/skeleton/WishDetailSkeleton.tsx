import ShimmerBar from "./ShimmerBar";

export default function WishDetailSkeleton() {
  return (
    <div className="flex flex-col">
      <ShimmerBar className="aspect-square w-full shrink-0 rounded-none" />
      <div className="flex flex-col gap-3 px-5 pt-5">
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <ShimmerBar className="h-5 w-24" />
            <ShimmerBar className="h-6 w-32" />
          </div>
          <ShimmerBar className="rounded-large h-11 w-full" />
        </div>
        <div className="flex w-full items-center gap-3 py-3">
          <div className="flex flex-1 flex-col gap-0.5">
            <ShimmerBar className="h-5 w-12" />
            <ShimmerBar className="h-5 w-40" />
          </div>
          <ShimmerBar className="size-5 shrink-0 rounded-full" />
        </div>
      </div>
    </div>
  );
}
