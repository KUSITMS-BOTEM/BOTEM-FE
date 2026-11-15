import { useMutation } from "@tanstack/react-query";

import { userService } from "@/apis/user/userService";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";

export const useWithdrawMutation = () =>
  useMutation({
    mutationFn: userService.withdraw,
    onSuccess: () => {
      useAuthStore.getState().clearAccessToken();
      queryClient.removeQueries({ queryKey: ["users", "me"] });
      queryClient.removeQueries({ queryKey: ["friends"] });
    },
  });
