import { cn } from "@/utils/cn";
import ShimmerBar from "@/app/(afterLogin)/wish/[wishId]/skeleton/ShimmerBar";

const WISH_CARD_SKELETON_COUNT = 4;
const CHIP_SKELETON_WIDTHS = ["w-14", "w-24", "w-28", "w-24", "w-20"];

export default function RecommendedWishListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full flex-col items-start gap-2 pt-2 pb-5">
        <ShimmerBar className="h-6 w-48" />
        <ShimmerBar className="h-4 w-64" />
      </div>
      <div className="flex w-full gap-1 overflow-hidden">
        {CHIP_SKELETON_WIDTHS.map((width, index) => (
          <ShimmerBar key={index} className={cn("h-9.5 shrink-0 rounded-full", width)} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        {Array.from({ length: WISH_CARD_SKELETON_COUNT }).map((_, index) => (
          <div key={index} className="flex w-42 flex-col overflow-hidden rounded-3xl">
            <ShimmerBar className="h-36.75 w-full rounded-none" />
            <div className="flex w-full flex-col gap-1 p-4">
              <ShimmerBar className="h-3.5 w-16" />
              <ShimmerBar className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
