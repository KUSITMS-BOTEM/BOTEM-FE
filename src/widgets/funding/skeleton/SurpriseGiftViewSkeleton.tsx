import ShimmerBar from "@/components/skeleton/ShimmerBar";

export default function SurpriseGiftViewSkeleton() {
  return (
    <main aria-busy className="flex min-h-dvh flex-col items-center gap-4 px-5 pt-[72px]">
      <div aria-hidden className="flex w-full flex-col gap-2 pt-2">
        <ShimmerBar className="h-8 w-3/5" />
        <ShimmerBar className="h-8 w-4/5" />
        <ShimmerBar className="h-5 w-full" />
      </div>
      <ShimmerBar aria-hidden className="h-78 w-[295px] rounded-t-[30px]" />
    </main>
  );
}
