import ShimmerBar from "@/components/skeleton/ShimmerBar";

export default function FundingGiftProofViewSkeleton() {
  return (
    <main aria-busy="true" aria-label="선물 인증 불러오는 중" className="flex min-h-dvh flex-col">
      <div className="flex flex-col gap-4 px-5 pt-16 pb-6">
        <ShimmerBar className="rounded-xxx-large aspect-square w-full" />
        <div className="flex flex-col gap-2">
          <ShimmerBar className="h-8 w-3/5" />
          <ShimmerBar className="h-8 w-1/2" />
          <ShimmerBar className="h-5 w-2/5" />
        </div>
      </div>
    </main>
  );
}
