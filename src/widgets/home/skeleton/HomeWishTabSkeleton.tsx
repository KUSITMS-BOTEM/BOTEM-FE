import ShimmerBar from "@/components/skeleton/ShimmerBar";

const WISH_CARD_SKELETON_COUNT = 4;

export default function HomeWishTabSkeleton() {
  return (
    <section aria-busy aria-label="위시 불러오는 중" className="flex w-full flex-col gap-1">
      <div className="flex h-[51px] w-full items-center justify-between">
        <ShimmerBar className="h-6 w-32" />
        <ShimmerBar className="h-4 w-12" />
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-3 gap-y-4 pb-5">
        {Array.from({ length: WISH_CARD_SKELETON_COUNT }, (_, index) => (
          <li key={index} className="flex min-w-0 flex-col overflow-hidden rounded-3xl">
            <ShimmerBar className="h-36.75 w-full rounded-none" />
            <div className="flex w-full flex-col gap-1 p-4">
              <ShimmerBar className="h-[19px] w-24" />
              <ShimmerBar className="h-[23px] w-20" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
