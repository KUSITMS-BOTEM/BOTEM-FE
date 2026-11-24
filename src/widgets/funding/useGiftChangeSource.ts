import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import { useFundingResultQuery } from "@/hooks/queries/funding/useFundingResultQuery";
import { useSurpriseRevealQuery } from "@/hooks/queries/funding/useSurpriseRevealQuery";

export type GiftChangeSource = {
  confirmedAmount: number;
  product: { name: string; price: number; imageUrl: string };
  productChanged: boolean;
};

// 다른 선물 고르기에 필요한 모인 금액·지금 상품을 가져온다.
// 일반 펀딩 결과·관리 상세는 개설자 전용이라, 서프라이즈 받는 사람은 공개 상세에서 같은 값을 읽는다
export const useGiftChangeSource = (fundingId: number, surprise: boolean) => {
  const resultQuery = useFundingResultQuery(fundingId, !surprise);
  const managementQuery = useFundingManagementQuery(fundingId, { enabled: !surprise });
  const surpriseQuery = useSurpriseRevealQuery(fundingId, surprise);

  if (surprise) {
    const reveal = surpriseQuery.data;
    const data: GiftChangeSource | undefined = reveal
      ? {
          confirmedAmount: reveal.confirmedAmount,
          product: {
            name: reveal.productName,
            price: reveal.productPrice,
            imageUrl: reveal.productImageUrl,
          },
          productChanged: reveal.productChanged,
        }
      : undefined;
    return {
      data,
      isLoading: surpriseQuery.isLoading,
      refetch: () => void surpriseQuery.refetch(),
    };
  }

  const result = resultQuery.data;
  const management = managementQuery.data;
  const data: GiftChangeSource | undefined =
    result && management
      ? {
          confirmedAmount: result.confirmedAmount,
          product: {
            name: management.product.name,
            price: management.product.price,
            imageUrl: management.product.imageUrl,
          },
          productChanged: management.productChanged,
        }
      : undefined;
  return {
    data,
    isLoading: resultQuery.isLoading || managementQuery.isLoading,
    refetch: () => {
      if (!result) void resultQuery.refetch();
      if (!management) void managementQuery.refetch();
    },
  };
};
