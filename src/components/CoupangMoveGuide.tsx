"use client";

import Button from "@/components/Button";
import List from "@/components/List";
import CoupangLogo from "@/assets/images/coupang-logo.png";

const COUPANG_URL = "https://www.coupang.com";

type CoupangMoveGuideProps = {
  className?: string;
};

export default function CoupangMoveGuide({ className }: CoupangMoveGuideProps) {
  return (
    <List
      type="product"
      thumbnailSrc={CoupangLogo}
      title="아직 상품 링크가 없나요?"
      description="쿠팡에서 상품을 고른 뒤 링크 복사하고 붙여넣어 주세요"
      right={
        <Button
          color="neutral"
          variant="fill"
          size="small"
          onClick={() => window.open(COUPANG_URL, "_blank", "noopener,noreferrer")}>
          쿠팡 이동
        </Button>
      }
      className={className}
    />
  );
}
