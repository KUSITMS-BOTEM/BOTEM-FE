import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { wishService } from "@/apis/wish/wishService";
import type { AddWishRequest } from "@/types/wish/wish";

export const useAddWishMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (body: AddWishRequest) => wishService.addWish(body),
    // TODO: 위시 담기 성공 후 이동할 페이지 디자인이 아직 안 나와서 임시로 추천 목록으로 되돌아간다
    onSuccess: () => router.replace("/wish/recommended"),
    onError: error => alert(error.message),
  });
};
