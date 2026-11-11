import Image from "next/image";
import { cn } from "@/utils/cn";
import Badge from "@/components/Badge";
import Button from "@/components/Button";

export type WishCardType = "funding" | "default" | "button";

type WishCardProps = {
  type?: WishCardType;
  productName: string;
  price: number;
  productImageUrl: string;
  onOpenFunding?: () => void;
  className?: string;
};

export default function WishCard({
  type = "default",
  productName,
  price,
  productImageUrl,
  onOpenFunding,
  className,
}: WishCardProps) {
  const hasButton = type === "button";

  return (
    <article
      className={cn("relative flex flex-col", hasButton ? "min-h-85 w-53.5" : "w-42", className)}>
      <div
        className={cn(
          "absolute -bottom-5 h-42.25 overflow-hidden rounded-full opacity-32 blur-[25.5px]",
          hasButton ? "right-[20.56%] left-[18.69%]" : "right-[12.5%] left-[10.12%]",
        )}>
        <Image src={productImageUrl} alt="" fill unoptimized className="object-cover" />
      </div>
      <div
        className={cn(
          "relative flex w-full shrink-0 flex-col items-end overflow-hidden rounded-t-[20px] px-4 py-3",
          hasButton ? "h-49.25" : "h-36.75",
        )}>
        <Image src={productImageUrl} alt={productName} fill unoptimized className="object-cover" />
        {type === "funding" && (
          <Badge color="brand" variant="fill" label="펀딩 중" className="relative" />
        )}
      </div>
      <div
        className={cn(
          "from-semantic-fill-default to-semantic-fill-default/60 relative flex w-full flex-col rounded-b-3xl bg-linear-to-b p-4",
          hasButton && "gap-6",
        )}>
        <div className="flex w-full min-w-0 flex-col gap-1 whitespace-nowrap">
          <p className="text-semantic-text-secondary truncate [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-small-weak)]">
            {productName}
          </p>
          <p className="text-semantic-text-strong truncate [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-title-x-small)]">
            {price.toLocaleString("ko-KR")}원
          </p>
        </div>
        {hasButton && (
          <Button
            color="brand"
            variant="weak"
            size="large"
            onClick={onOpenFunding}
            className="w-full">
            펀딩 열기
          </Button>
        )}
      </div>
    </article>
  );
}
