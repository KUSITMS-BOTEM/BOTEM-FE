import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { wishService } from "@/apis/wish/wishService";
import { queryClient } from "@/lib/queryClient";

export const useDeleteWishMutation = (wishId: string) => {
  const router = useRouter();

  return useMutation({
    mutationFn: () => wishService.deleteWish(wishId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["wishes", wishId] });
      router.replace("/main");
    },
  });
};
