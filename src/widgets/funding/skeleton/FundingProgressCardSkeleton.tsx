import ShimmerBar from "@/components/skeleton/ShimmerBar";

// 부모(aspect-320/401 래퍼)를 가득 채운다. 폭이 가변이라 내부 크기는 % 기준으로 잡는다
export default function FundingProgressCardSkeleton() {
  return (
    <div aria-hidden className="absolute inset-0">
      <ShimmerBar className="absolute inset-0 rounded-4xl" />
      <div className="absolute inset-0 flex flex-col justify-between p-[6%]">
        <div className="flex items-center gap-[3%]">
          <ShimmerBar className="aspect-square w-[15%] rounded-lg bg-white/60" />
          <div className="flex flex-1 flex-col gap-1.5">
            <ShimmerBar className="h-3.5 w-3/5 bg-white/60" />
            <ShimmerBar className="h-3 w-2/5 bg-white/60" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <ShimmerBar className="h-5 w-3/5 bg-white/60" />
          <ShimmerBar className="h-14 w-1/2 bg-white/60" />
          <ShimmerBar className="h-4 w-2/5 bg-white/60" />
        </div>
      </div>
    </div>
  );
}
