"use client";

import { useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isValidUrl } from "@/utils/isValidUrl";
import FundingExtendSheet from "@/widgets/funding/FundingExtendSheet";
import FundingResultView, { type FundingResult } from "@/widgets/funding/FundingResultView";
import SampleProduct from "@/assets/images/samples/sample-product.png";

// TODO(API): 펀딩 결과 조회 API가 생기면 교체한다. 미달 화면을 확인하려면 goalAchieved를 false로 바꾼다
const MOCK_RESULT: FundingResult & { productUrl: string; deadline: string } = {
  goalAchieved: true,
  collectedAmount: 123456678,
  productName: "소니 WH-1000XM5",
  productImage: SampleProduct,
  productPrice: 364000,
  giftChanged: false,
  canExtend: true,
  contributors: [{ userId: 1 }, { userId: 2 }, { userId: 3 }, { userId: 4 }, { userId: 5 }],
  productUrl: "https://www.coupang.com",
  deadline: "2026-12-31",
};

type FundingResultContainerProps = {
  fundingId: string;
};

export default function FundingResultContainer({ fundingId }: FundingResultContainerProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const [extendOpen, setExtendOpen] = useState(false);
  const result = MOCK_RESULT;

  const handleBuy = () => {
    if (!isValidUrl(result.productUrl)) return;
    window.open(result.productUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <FundingResultView
        result={result}
        reduceMotion={reduceMotion}
        onClose={() => router.replace("/home")}
        onBuy={handleBuy}
        // TODO(API): change-gift 라우트가 아직 없다. 화면을 만들 때 fundingService.changeFundingProduct(PATCH /api/fundings/{id}/product)를 연결한다
        onChangeGift={() => router.push(`/funding/${fundingId}/change-gift`)}
        onExtend={() => setExtendOpen(true)}
      />
      <FundingExtendSheet
        open={extendOpen}
        collectedAmount={result.collectedAmount}
        currentDeadline={result.deadline}
        // TODO(API): fundingService.extendFunding(POST /api/fundings/{id}/extension)은 있다. mutation 훅을 만들어 연결하고 성공 시 결과·관리·홈 캐시를 무효화한다
        onExtend={() => setExtendOpen(false)}
        onClose={() => setExtendOpen(false)}
      />
    </>
  );
}
