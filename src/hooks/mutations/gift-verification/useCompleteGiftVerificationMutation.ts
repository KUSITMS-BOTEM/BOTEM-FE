import { useMutation, useQueryClient } from "@tanstack/react-query";

import { giftVerificationService } from "@/apis/gift-verification/giftVerificationService";
import { giftVerificationBannerQueryKey } from "@/hooks/queries/home/useGiftVerificationBannerQuery";
import { giftVerificationTargetsQueryKey } from "@/hooks/queries/home/useGiftVerificationTargetsQuery";

type CompleteGiftVerificationVariables = {
  giftVerificationId: number;
  image: File;
  thankYouMessage: string;
  replacementProductName: string | null;
};

export const useCompleteGiftVerificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 업로드 URL 발급 → S3 PUT → 완료 요청까지가 "인증 보내기" 한 동작이다 (완료 API가 S3 객체 존재를 확인한다)
    mutationFn: async ({
      giftVerificationId,
      image,
      thankYouMessage,
      replacementProductName,
    }: CompleteGiftVerificationVariables) => {
      const upload = await giftVerificationService.createImageUploadUrl(giftVerificationId, {
        contentType: image.type,
        contentLength: image.size,
      });
      if (!upload) throw new Error("업로드 URL 발급에 실패했습니다.");
      await giftVerificationService.uploadImage(upload.uploadUrl, image);
      return giftVerificationService.complete(giftVerificationId, {
        imageUrl: upload.imageUrl,
        thankYouMessage: thankYouMessage.trim() || null,
        // 구매 체크 UI 디자인이 나오기 전까지는 인증 화면 진입을 보탬 링크 구매로 간주한다 (API가 true일 때만 완료 허용)
        purchasedThroughBotemLink: true,
        replacementProductName,
      });
    },
    onSuccess: () => {
      // 인증 화면이 목록을 구독 중이라 지금 다시 받으면 대상이 사라져 홈 이동 전에 "인증할 선물이 없어요"가 깜빡이므로,
      // 목록(배너도 같은 prefix)은 오래됨 표시만 하고 홈 진입 때 다시 받는다
      queryClient.invalidateQueries({
        queryKey: giftVerificationTargetsQueryKey,
        refetchType: "none",
      });
      // 업로드 중 닫기로 홈에 먼저 와 있으면 배너가 이미 떠 있으므로 그때만 바로 다시 받는다 (인증 화면은 배너를 구독하지 않는다)
      queryClient.invalidateQueries({ queryKey: giftVerificationBannerQueryKey });
      queryClient.invalidateQueries({ queryKey: ["home", "fundings"] });
    },
  });
};
