import ShimmerBar from "@/components/skeleton/ShimmerBar";

export default function SurpriseDetailViewSkeleton() {
  return (
    <main aria-busy className="flex min-h-dvh flex-col gap-6 px-5 pt-[72px]">
      <div aria-hidden className="flex flex-col gap-2">
        <ShimmerBar className="h-7 w-3/5" />
        <ShimmerBar className="h-4 w-2/5" />
      </div>
      <ShimmerBar aria-hidden className="rounded-x-large aspect-square w-full" />
      <ShimmerBar aria-hidden className="h-5 w-1/2" />
    </main>
  );
}
