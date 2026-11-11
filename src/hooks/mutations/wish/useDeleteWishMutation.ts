import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { wishService } from "@/apis/wish/wishService";

export const useDeleteWishMutation = (wishId: string) => {
  const router = useRouter();

  return useMutation({
    mutationFn: () => wishService.deleteWish(wishId),
    // 캐시를 즉시 지우면 아직 마운트된 상세 페이지가 삭제된 위시를 재조회할 수 있다 — 페이지를 떠나면 gcTime에 따라 자동 정리된다
    onSuccess: () => router.replace("/home"),
  });
};
