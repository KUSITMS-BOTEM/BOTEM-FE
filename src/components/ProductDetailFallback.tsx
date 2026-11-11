"use client";

import Button from "@/components/Button";
import Header from "@/components/Header";
import IconLeft from "@/assets/icons/icon-left.svg?react";

type ProductDetailFallbackProps = {
  message: string;
  onBack: () => void;
  onRetry?: () => void;
};

export default function ProductDetailFallback({
  message,
  onBack,
  onRetry,
}: ProductDetailFallbackProps) {
  return (
    <div className="flex flex-col">
      <Header
        title="위시 상품"
        leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: onBack }}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
          {message}
        </p>
        {onRetry && <Button onClick={onRetry}>다시 시도</Button>}
      </div>
    </div>
  );
}
