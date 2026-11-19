import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { wishService } from "@/apis/wish/wishService";
import { homeWishesQueryKey } from "@/hooks/queries/wish/useHomeWishesQuery";
import { wishesQueryKey } from "@/hooks/queries/wish/useWishesQuery";
import { wishQueryKey } from "@/hooks/queries/wish/useWishQuery";
import type { AddWishRequest } from "@/types/wish/wish";

export const useAddWishMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AddWishRequest) => wishService.addWish(body),
    onSuccess: wish => {
      // ["wishes"] 접두사 전체를 무효화하면 아래에서 채울 상세 캐시까지 stale이 되므로 목록 키만 지정한다
      queryClient.invalidateQueries({ queryKey: wishesQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: homeWishesQueryKey });
      // 성공인데 data가 비어 있으면 이동할 위시 id가 없어 추천 목록으로 되돌린다
      if (!wish) return router.replace("/wish/recommended");
      // useWishQuery의 키는 useParams의 문자열 wishId라 String으로 맞춰야 캐시가 적중한다
      queryClient.setQueryData(wishQueryKey(String(wish.id)), wish);
      router.replace(`/wish/${wish.id}`);
    },
  });
};
